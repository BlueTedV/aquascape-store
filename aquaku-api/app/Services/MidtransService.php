<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Throwable;

class MidtransService
{
    private bool $isConfigured = false;

    public function __construct()
    {
        $serverKey = (string) config('services.midtrans.server_key');

        if (! empty($serverKey)) {
            $isProductionConfig = filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN);

            // Auto-detect production key prefix (Mid-server- vs SB-Mid-server-)
            if (str_starts_with($serverKey, 'Mid-server-')) {
                $isProduction = true;
            } elseif (str_starts_with($serverKey, 'SB-Mid-server-')) {
                $isProduction = false;
            } else {
                $isProduction = $isProductionConfig;
            }

            Config::$serverKey = $serverKey;
            Config::$clientKey = (string) config('services.midtrans.client_key');
            Config::$isProduction = $isProduction;
            Config::$isSanitized = (bool) config('services.midtrans.is_sanitized', true);
            Config::$is3ds = (bool) config('services.midtrans.is_3ds', true);

            $this->isConfigured = true;
        }
    }

    public function isConfigured(): bool
    {
        return $this->isConfigured;
    }

    public function createSnapTransaction(array $order): ?array
    {
        if (! $this->isConfigured) {
            Log::warning('Midtrans is not configured (MIDTRANS_SERVER_KEY is missing). Using fallback mode.');
            return null;
        }

        try {
            $items = array_map(function (array $item) {
                return [
                    'id' => substr((string) ($item['productId'] ?? $item['id'] ?? 'item'), 0, 50),
                    'price' => (int) $item['price'],
                    'quantity' => (int) max(1, $item['quantity']),
                    'name' => substr((string) $item['productName'], 0, 50),
                ];
            }, $order['items'] ?? []);

            if (isset($order['shippingCost']) && (int) $order['shippingCost'] > 0) {
                $items[] = [
                    'id' => 'SHIPPING',
                    'price' => (int) $order['shippingCost'],
                    'quantity' => 1,
                    'name' => 'Shipping Fee (' . substr((string) ($order['courier'] ?? 'Courier'), 0, 35) . ')',
                ];
            }

            $itemsSum = array_sum(array_map(fn (array $i) => (int) $i['price'] * (int) $i['quantity'], $items));
            $grossAmount = $itemsSum > 0 ? $itemsSum : (int) $order['totalAmount'];

            $params = [
                'transaction_details' => [
                    'order_id' => (string) $order['orderNumber'],
                    'gross_amount' => $grossAmount,
                ],
                'customer_details' => [
                    'first_name' => (string) ($order['customerName'] ?? 'Customer'),
                    'email' => (string) ($order['customerEmail'] ?? ''),
                    'phone' => (string) ($order['customerPhone'] ?? ''),
                    'billing_address' => [
                        'first_name' => (string) ($order['customerName'] ?? 'Customer'),
                        'email' => (string) ($order['customerEmail'] ?? ''),
                        'phone' => (string) ($order['customerPhone'] ?? ''),
                        'address' => (string) ($order['shippingAddress'] ?? ''),
                        'city' => (string) ($order['shippingCity'] ?? ''),
                        'postal_code' => (string) ($order['shippingPostalCode'] ?? ''),
                    ],
                    'shipping_address' => [
                        'first_name' => (string) ($order['customerName'] ?? 'Customer'),
                        'email' => (string) ($order['customerEmail'] ?? ''),
                        'phone' => (string) ($order['customerPhone'] ?? ''),
                        'address' => (string) ($order['shippingAddress'] ?? ''),
                        'city' => (string) ($order['shippingCity'] ?? ''),
                        'postal_code' => (string) ($order['shippingPostalCode'] ?? ''),
                    ],
                ],
                'item_details' => $items,
            ];

            $paymentMethod = $order['paymentMethod'] ?? null;
            if ($paymentMethod === 'bank_transfer') {
                $params['enabled_payments'] = ['bca_va', 'bni_va', 'bri_va', 'cimb_va', 'permata_va', 'other_va'];
            } elseif ($paymentMethod === 'qris') {
                $params['enabled_payments'] = ['gopay', 'qris', 'shopeepay'];
            } elseif ($paymentMethod === 'credit_card') {
                $params['enabled_payments'] = ['credit_card'];
            }

            $snapToken = Snap::getSnapToken($params);
            $redirectUrl = Snap::getSnapUrl($params);

            return [
                'snapToken' => $snapToken,
                'redirectUrl' => $redirectUrl,
            ];
        } catch (Throwable $e) {
            Log::error('Failed to create Midtrans Snap transaction: ' . $e->getMessage(), [
                'orderNumber' => $order['orderNumber'] ?? null,
                'exception' => $e,
            ]);

            return null;
        }
    }

    public function verifyNotificationSignature(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;
        $serverKey = (string) config('services.midtrans.server_key');

        if (! $orderId || ! $statusCode || ! $grossAmount || ! $signatureKey || empty($serverKey)) {
            return false;
        }

        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return hash_equals($expectedSignature, $signatureKey);
    }
}

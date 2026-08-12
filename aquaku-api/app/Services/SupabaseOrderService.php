<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class SupabaseOrderService
{
    private string $url;

    private string $key;

    public function __construct()
    {
        $this->url = rtrim((string) config('services.supabase.url'), '/');
        $this->key = (string) config('services.supabase.key');

        if ($this->url === '' || $this->key === '') {
            throw new RuntimeException('Supabase API configuration is missing.');
        }
    }

    public function createOrder(array $payload, ?string $userId = null): array
    {
        $orderNumber = 'AQ-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $subtotal = 0;
        $itemsData = [];

        foreach ($payload['items'] as $item) {
            $itemPrice = (int) ($item['price'] ?? 0);
            $itemQty = max(1, (int) ($item['quantity'] ?? 1));
            $itemSubtotal = $itemPrice * $itemQty;
            $subtotal += $itemSubtotal;

            $itemsData[] = [
                'product_id' => $item['id'] ?? null,
                'product_name' => trim((string) ($item['name'] ?? 'Product')),
                'product_slug' => trim((string) ($item['slug'] ?? 'product')),
                'product_image' => trim((string) ($item['image'] ?? '/images/products/product-placeholder.svg')),
                'price' => $itemPrice,
                'quantity' => $itemQty,
                'subtotal' => $itemSubtotal,
            ];
        }

        $shippingCost = (int) ($payload['shippingCost'] ?? 0);
        $totalAmount = $subtotal + $shippingCost;

        $orderPayload = [
            'order_number' => $orderNumber,
            'user_id' => $userId,
            'customer_name' => trim((string) ($payload['customerName'] ?? '')),
            'customer_email' => trim((string) ($payload['customerEmail'] ?? '')),
            'customer_phone' => trim((string) ($payload['customerPhone'] ?? '')),
            'shipping_address' => trim((string) ($payload['shippingAddress'] ?? '')),
            'shipping_city' => trim((string) ($payload['shippingCity'] ?? '')),
            'shipping_postal_code' => trim((string) ($payload['shippingPostalCode'] ?? '')),
            'courier' => trim((string) ($payload['courier'] ?? 'Standard Courier')),
            'shipping_cost' => $shippingCost,
            'payment_method' => trim((string) ($payload['paymentMethod'] ?? 'bank_transfer')),
            'payment_status' => 'unpaid',
            'order_status' => 'pending',
            'subtotal' => $subtotal,
            'total_amount' => $totalAmount,
            'notes' => isset($payload['notes']) ? trim((string) $payload['notes']) : null,
        ];

        // Insert Order into Supabase
        $orderRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/orders', $orderPayload)
            ->throw()
            ->json();

        $order = $orderRows[0] ?? $orderRows;
        $orderId = $order['id'];

        // Insert Order Items
        $insertedItems = [];
        foreach ($itemsData as $itemData) {
            $itemPayload = array_merge($itemData, ['order_id' => $orderId]);
            $itemRows = $this->request()
                ->withHeaders(['Prefer' => 'return=representation'])
                ->post('/rest/v1/order_items', $itemPayload)
                ->throw()
                ->json();

            $insertedItems[] = $itemRows[0] ?? $itemRows;
        }

        return $this->mapOrder($order, $insertedItems);
    }

    public function getOrderByNumber(string $orderNumber): ?array
    {
        $rows = $this->request()
            ->get('/rest/v1/orders', [
                'select' => '*',
                'order_number' => "eq.{$orderNumber}",
                'limit' => 1,
            ])
            ->throw()
            ->json();

        $order = $rows[0] ?? null;
        if (! is_array($order)) {
            return null;
        }

        $items = $this->request()
            ->get('/rest/v1/order_items', [
                'select' => '*',
                'order_id' => "eq.{$order['id']}",
            ])
            ->throw()
            ->json();

        return $this->mapOrder($order, $items);
    }

    public function getUserOrders(string $userId, ?string $email = null): array
    {
        $orFilters = ["user_id.eq.{$userId}"];
        if ($email !== null && $email !== '') {
            $orFilters[] = "customer_email.eq.{$email}";
        }

        $params = [
            'select' => '*',
            'or' => '(' . implode(',', $orFilters) . ')',
            'order' => 'created_at.desc',
        ];

        $orders = $this->request()
            ->get('/rest/v1/orders', $params)
            ->throw()
            ->json();

        return collect($orders)->map(function (array $order) {
            $items = $this->request()
                ->get('/rest/v1/order_items', [
                    'select' => '*',
                    'order_id' => "eq.{$order['id']}",
                ])
                ->throw()
                ->json();

            return $this->mapOrder($order, $items);
        })->all();
    }

    public function getAdminOrders(?string $status = null): array
    {
        $params = [
            'select' => '*',
            'order' => 'created_at.desc',
        ];

        if ($status && $status !== 'all') {
            $params['order_status'] = "eq.{$status}";
        }

        $orders = $this->request()
            ->get('/rest/v1/orders', $params)
            ->throw()
            ->json();

        return collect($orders)->map(function (array $order) {
            $items = $this->request()
                ->get('/rest/v1/order_items', [
                    'select' => '*',
                    'order_id' => "eq.{$order['id']}",
                ])
                ->throw()
                ->json();

            return $this->mapOrder($order, $items);
        })->all();
    }

    public function updateOrderStatus(string $id, string $status, ?string $paymentStatus = null, ?string $trackingNumber = null): array
    {
        $updatePayload = [
            'order_status' => $status,
            'updated_at' => now()->toIso8601String(),
        ];

        if ($trackingNumber !== null) {
            $updatePayload['shipping_resi'] = trim($trackingNumber);
        }

        if ($paymentStatus) {
            $updatePayload['payment_status'] = $paymentStatus;
        } elseif (in_array($status, ['processing', 'shipped', 'completed'], true)) {
            $updatePayload['payment_status'] = 'paid';
        }

        $rows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->withQueryParameters(['id' => 'eq.' . $id])
            ->patch('/rest/v1/orders', $updatePayload)
            ->throw()
            ->json();

        $order = $rows[0] ?? null;
        abort_if(! is_array($order), 404, 'Order not found.');

        $items = $this->request()
            ->get('/rest/v1/order_items', [
                'select' => '*',
                'order_id' => "eq.{$id}",
            ])
            ->throw()
            ->json();

        return $this->mapOrder($order, $items);
    }

    private function request(): PendingRequest
    {
        return Http::baseUrl($this->url)
            ->acceptJson()
            ->withHeaders([
                'apikey' => $this->key,
                'Authorization' => "Bearer {$this->key}",
            ]);
    }

    private function mapOrder(array $order, array $items): array
    {
        $res = [
            'id' => (string) $order['id'],
            'orderNumber' => (string) $order['order_number'],
            'userId' => $order['user_id'] ?? null,
            'customerName' => (string) $order['customer_name'],
            'customerEmail' => (string) $order['customer_email'],
            'customerPhone' => (string) $order['customer_phone'],
            'shippingAddress' => (string) $order['shipping_address'],
            'shippingCity' => (string) $order['shipping_city'],
            'shippingPostalCode' => (string) $order['shipping_postal_code'],
            'courier' => (string) $order['courier'],
            'shippingCost' => (int) $order['shipping_cost'],
            'paymentMethod' => (string) $order['payment_method'],
            'paymentStatus' => (string) $order['payment_status'],
            'orderStatus' => (string) $order['order_status'],
            'subtotal' => (int) $order['subtotal'],
            'totalAmount' => (int) $order['total_amount'],
            'trackingNumber' => $order['shipping_resi'] ?? null,
            'notes' => $order['notes'] ?? null,
            'createdAt' => (string) $order['created_at'],
            'items' => array_map(function (array $item) {
                return [
                    'id' => (string) $item['id'],
                    'productId' => $item['product_id'] ?? null,
                    'productName' => (string) $item['product_name'],
                    'productSlug' => (string) $item['product_slug'],
                    'productImage' => (string) $item['product_image'],
                    'price' => (int) $item['price'],
                    'quantity' => (int) $item['quantity'],
                    'subtotal' => (int) $item['subtotal'],
                ];
            }, $items),
        ];

        if (in_array($res['paymentMethod'], ['bank_transfer', 'qris', 'credit_card'], true)) {
            $res['midtransSnapToken'] = 'SNAP-' . strtoupper(md5($res['orderNumber']));
            $res['midtransRedirectUrl'] = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . $res['midtransSnapToken'];
        }

        return $res;
    }
}

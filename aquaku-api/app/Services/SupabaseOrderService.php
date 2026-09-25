<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Data service managing orders and checkout workflows.
 *
 * Communicates directly with Supabase PostgREST tables (`orders`, `order_items`, `products`),
 * verifying inventory availability, deducting stock upon purchase, and generating
 * Midtrans Snap transaction tokens for unpaid online orders.
 */
class SupabaseOrderService
{
    private string $url;

    private string $key;

    private MidtransService $midtrans;

    private VoucherService $vouchers;

    public function __construct(?MidtransService $midtrans = null, ?VoucherService $vouchers = null)
    {
        $this->url = rtrim((string) config('services.supabase.url'), '/');
        $this->key = (string) config('services.supabase.key');
        $this->midtrans = $midtrans ?? new MidtransService;
        $this->vouchers = $vouchers ?? app(VoucherService::class);

        if ($this->url === '' || $this->key === '') {
            throw new RuntimeException('Supabase API configuration is missing.');
        }
    }

    /**
     * Create and record a new customer order.
     *
     * Validates live inventory levels in Supabase, persists the order and its line items,
     * reduces available stock accordingly, and initiates a Midtrans Snap transaction
     * if an online payment method is selected.
     */
    public function createOrder(array $payload, ?string $userId = null): array
    {
        // Generate human-readable order number with date prefix and random suffix (e.g. AQ-20260903-ABC123)
        $orderNumber = 'AQ-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $subtotal = 0;
        $itemsData = [];

        // Validate items, accumulate subtotal, and verify stock availability in Supabase
        foreach ($payload['items'] as $index => $item) {
            $itemQty = max(1, (int) ($item['quantity'] ?? 1));
            $itemPrice = max(0, (int) ($item['price'] ?? 0));

            $productId = $item['id'] ?? null;
            $productSlug = $item['slug'] ?? null;
            $resolvedProdId = null;
            $currentStock = null;

            // Query product by UUID or slug to check real-time stock and true DB price
            $prodParams = [];
            if ($productId) {
                $prodParams['id'] = "eq.{$productId}";
            } elseif ($productSlug) {
                $prodParams['slug'] = "eq.{$productSlug}";
            }

            if (! empty($prodParams)) {
                try {
                    $prodRows = $this->request()
                        ->get('/rest/v1/products', array_merge(['select' => 'id,name,price,stock'], $prodParams))
                        ->json();
                    $prod = $prodRows[0] ?? null;
                    if ($prod) {
                        // Enforce server-side catalog price to prevent client tampering
                        if (isset($prod['price'])) {
                            $itemPrice = (int) $prod['price'];
                        }

                        $currentStock = (int) ($prod['stock'] ?? 0);
                        if ($currentStock < $itemQty) {
                            $prodName = $prod['name'] ?? ($item['name'] ?? 'Product');
                            abort(422, "Product '{$prodName}' has insufficient stock. Requested: {$itemQty}, Available: {$currentStock}.");
                        }
                        $resolvedProdId = $prod['id'];
                    }
                } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
                    throw $e;
                } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
                    throw $e;
                } catch (\Throwable $e) {
                    Log::warning('Stock check failed', ['error' => $e->getMessage()]);
                }
            }

            $itemSubtotal = $itemPrice * $itemQty;
            $subtotal += $itemSubtotal;

            $itemsData[] = [
                'product_id' => $productId ?? $resolvedProdId,
                'product_name' => trim((string) ($item['name'] ?? 'Product')),
                'product_slug' => trim((string) ($item['slug'] ?? 'product')),
                'product_image' => trim((string) ($item['image'] ?? '/images/products/product-placeholder.svg')),
                'price' => $itemPrice,
                'quantity' => $itemQty,
                'subtotal' => $itemSubtotal,
                '_resolved_prod_id' => $resolvedProdId,
                '_current_stock' => $currentStock,
            ];
        }

        // Compute net total amount factoring in shipping fee and server-validated voucher discounts
        $shippingCost = (int) ($payload['shippingCost'] ?? 0);
        $voucherCode = ! empty($payload['voucherCode']) ? trim((string) $payload['voucherCode']) : null;
        $discountAmount = 0;

        if ($voucherCode) {
            try {
                $voucherResult = $this->vouchers->validate($voucherCode, $subtotal, $shippingCost);
                $discountAmount = (int) ($voucherResult['discountAmount'] ?? 0);
            } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
                throw $e;
            } catch (\Throwable) {
                // If invalid or inactive, discard discount
                $voucherCode = null;
                $discountAmount = 0;
            }
        }

        $totalAmount = max(0, $subtotal + $shippingCost - $discountAmount);

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
            'discount_amount' => $discountAmount,
            'voucher_code' => isset($payload['voucherCode']) ? strtoupper(trim((string) $payload['voucherCode'])) : null,
            'total_amount' => $totalAmount,
            'notes' => isset($payload['notes']) ? trim((string) $payload['notes']) : null,
        ];

        // Insert master order into Supabase with return representation to retrieve generated UUID
        $orderRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/orders', $orderPayload)
            ->throw()
            ->json();

        $order = $orderRows[0] ?? $orderRows;
        $orderId = $order['id'];

        // Persist order items and decrement product stock in Supabase
        $insertedItems = [];
        foreach ($itemsData as $itemData) {
            $resolvedProdId = $itemData['_resolved_prod_id'] ?? null;
            $currentStock = $itemData['_current_stock'] ?? null;

            unset($itemData['_resolved_prod_id'], $itemData['_current_stock']);

            $itemPayload = array_merge($itemData, ['order_id' => $orderId]);
            $itemRows = $this->request()
                ->withHeaders(['Prefer' => 'return=representation'])
                ->post('/rest/v1/order_items', $itemPayload)
                ->throw()
                ->json();

            $insertedItems[] = $itemRows[0] ?? $itemRows;

            // Reduce product stock count, clamping at 0 to avoid negative inventory
            if ($resolvedProdId && $currentStock !== null) {
                try {
                    $this->request()->post('/rest/v1/rpc/decrement_product_stock', [
                        'p_id' => $resolvedProdId,
                        'qty' => $itemData['quantity'],
                    ]);
                } catch (\Throwable) {
                    // Non-fatal if stock patch fails
                }
            }
        }

        $res = $this->mapOrder($order, $insertedItems);

        // For online payment gateways, request Snap transaction token and checkout redirect URL
        $onlineMethods = ['midtrans', 'bank_transfer', 'qris', 'credit_card'];
        if (in_array($res['paymentMethod'], $onlineMethods, true) && $res['paymentStatus'] === 'unpaid') {
            $snapResult = $this->midtrans->createSnapTransaction($res);
            $res['midtransSnapToken'] = $snapResult['snapToken'];
            $res['midtransRedirectUrl'] = $snapResult['redirectUrl'];

            // Store token in shipping_resi temporarily while unpaid
            $tokenData = 'SNAP:' . $res['midtransSnapToken'] . '|URL:' . $res['midtransRedirectUrl'];
            $this->request()
                ->withHeaders(['Prefer' => 'return=minimal'])
                ->withQueryParameters(['id' => 'eq.' . $orderId])
                ->patch('/rest/v1/orders', ['shipping_resi' => $tokenData]);
        }

        return $res;
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

        $res = $this->mapOrder($order, $items);

        return $res;
    }

    public function getUserOrders(string $userId, ?string $email = null): array
    {
        // Query orders matching either the user's UUID or their email address (capturing guest orders made with the same email)
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
        // Check current status before updating to detect transitions to cancelled
        $previousStatus = null;
        try {
            $existingRows = $this->request()
                ->get('/rest/v1/orders', [
                    'select' => 'id,order_status',
                    'id' => "eq.{$id}",
                    'limit' => 1,
                ])
                ->json();
            $previousStatus = $existingRows[0]['order_status'] ?? null;
        } catch (\Throwable) {
            // Non-fatal if pre-check fails
        }

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

        // Restore stock when an order is cancelled
        if ($previousStatus !== null && $previousStatus !== 'cancelled' && $status === 'cancelled') {
            $this->restockOrderItems($id);
        }

        $items = $this->request()
            ->get('/rest/v1/order_items', [
                'select' => '*',
                'order_id' => "eq.{$id}",
            ])
            ->throw()
            ->json();

        return $this->mapOrder($order, $items);
    }

    private function restockOrderItems(string $orderId): void
    {
        try {
            $items = $this->request()
                ->get('/rest/v1/order_items', [
                    'select' => 'product_id,product_slug,quantity',
                    'order_id' => "eq.{$orderId}",
                ])
                ->json();

            if (! is_array($items)) {
                return;
            }

            foreach ($items as $item) {
                $qty = (int) ($item['quantity'] ?? 0);
                if ($qty <= 0) {
                    continue;
                }

                $prodId = $item['product_id'] ?? null;
                $prodSlug = $item['product_slug'] ?? null;

                $filter = [];
                if ($prodId) {
                    $filter['id'] = "eq.{$prodId}";
                } elseif ($prodSlug) {
                    $filter['slug'] = "eq.{$prodSlug}";
                }

                if (! empty($filter)) {
                    $prodRows = $this->request()
                        ->get('/rest/v1/products', array_merge(['select' => 'id,stock'], $filter))
                        ->json();
                    $prod = $prodRows[0] ?? null;
                    if ($prod) {
                        $currentStock = (int) ($prod['stock'] ?? 0);
                        $newStock = $currentStock + $qty;
                        $this->request()
                            ->withQueryParameters(['id' => 'eq.' . $prod['id']])
                            ->patch('/rest/v1/products', ['stock' => $newStock]);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to restock order items on cancellation', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function updateOrderStatusByOrderNumber(string $orderNumber, string $status, ?string $paymentStatus = null): ?array
    {
        $order = $this->getOrderByNumber($orderNumber);
        if (! $order) {
            return null;
        }

        return $this->updateOrderStatus($order['id'], $status, $paymentStatus);
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
        $trackingNumber = $order['shipping_resi'] ?? null;
        $snapToken = null;
        $snapUrl = null;

        if (
            in_array($order['payment_method'] ?? '', ['bank_transfer', 'qris', 'credit_card'], true) &&
            ($order['payment_status'] ?? '') === 'unpaid' &&
            $trackingNumber && str_starts_with($trackingNumber, 'SNAP:')
        ) {
            preg_match('/SNAP:(.*)\|URL:(.*)/', $trackingNumber, $matches);
            if (count($matches) === 3) {
                $snapToken = $matches[1];
                $snapUrl = $matches[2];
            }
            $trackingNumber = null; // Hide the internal token from tracking number UI
        }

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
            'discountAmount' => isset($order['discount_amount']) ? (int) $order['discount_amount'] : 0,
            'voucherCode' => $order['voucher_code'] ?? null,
            'totalAmount' => (int) $order['total_amount'],
            'trackingNumber' => $trackingNumber,
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

        if ($snapToken) {
            $res['midtransSnapToken'] = $snapToken;
            $res['midtransRedirectUrl'] = $snapUrl;
        }

        return $res;
    }

    public function getAdminAnalytics(): array
    {
        $orders = $this->request()
            ->get('/rest/v1/orders', [
                'select' => '*',
                'order' => 'created_at.desc',
            ])
            ->json();

        $products = $this->request()
            ->get('/rest/v1/products', [
                'select' => 'id,name,slug,stock,image_url,price',
            ])
            ->json();

        $orderItems = $this->request()
            ->get('/rest/v1/order_items', [
                'select' => '*',
            ])
            ->json();

        $totalRevenue = 0;
        $totalOrders = count($orders);

        $statusCounts = [
            'pending' => 0,
            'processing' => 0,
            'shipped' => 0,
            'completed' => 0,
            'cancelled' => 0,
        ];

        foreach ($orders as $o) {
            $st = $o['order_status'] ?? 'pending';
            if (isset($statusCounts[$st])) {
                $statusCounts[$st]++;
            }
            if ($st !== 'cancelled' && (($o['payment_status'] ?? '') === 'paid' || in_array($st, ['processing', 'shipped', 'completed'], true))) {
                $totalRevenue += (int) ($o['total_amount'] ?? 0);
            }
        }

        $paidOrdersCount = array_sum([$statusCounts['processing'], $statusCounts['shipped'], $statusCounts['completed']]);
        $avgOrderValue = $paidOrdersCount > 0 ? (int) round($totalRevenue / $paidOrdersCount) : ($totalOrders > 0 ? (int) round($totalRevenue / $totalOrders) : 0);

        // Low stock products
        $lowStockProducts = collect($products)
            ->filter(fn ($p) => (int) ($p['stock'] ?? 0) <= 3)
            ->map(fn ($p) => [
                'id' => (string) $p['id'],
                'name' => (string) $p['name'],
                'slug' => (string) $p['slug'],
                'stock' => (int) $p['stock'],
                'price' => (int) $p['price'],
                'image' => (string) ($p['image_url'] ?? '/images/products/product-placeholder.svg'),
            ])
            ->values()
            ->all();

        // Top selling products
        $productSales = [];
        foreach ($orderItems as $item) {
            $pName = $item['product_name'] ?? 'Product';
            $qty = (int) ($item['quantity'] ?? 1);
            $sub = (int) ($item['subtotal'] ?? 0);

            if (! isset($productSales[$pName])) {
                $productSales[$pName] = [
                    'name' => $pName,
                    'totalQty' => 0,
                    'totalRevenue' => 0,
                    'image' => $item['product_image'] ?? '/images/products/product-placeholder.svg',
                ];
            }
            $productSales[$pName]['totalQty'] += $qty;
            $productSales[$pName]['totalRevenue'] += $sub;
        }

        $topProducts = collect($productSales)
            ->sortByDesc('totalQty')
            ->take(5)
            ->values()
            ->all();

        return [
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'averageOrderValue' => $avgOrderValue,
            'statusCounts' => $statusCounts,
            'lowStockCount' => count($lowStockProducts),
            'lowStockProducts' => $lowStockProducts,
            'topProducts' => $topProducts,
        ];
    }

    public function deleteAllOrders(): void
    {
        $this->request()
            ->withQueryParameters(['id' => 'not.is.null'])
            ->delete('/rest/v1/order_items')
            ->throw();

        $this->request()
            ->withQueryParameters(['id' => 'not.is.null'])
            ->delete('/rest/v1/orders')
            ->throw();
    }
}

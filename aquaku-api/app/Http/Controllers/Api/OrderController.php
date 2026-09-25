<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MidtransService;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseOrderService;
use App\Services\VoucherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Handles the order and payment lifecycle.
 *
 * Coordinates checkout submission, voucher validation, customer and administrative
 * order inquiries, and handles asynchronous payment webhook notifications from Midtrans.
 */
class OrderController extends Controller
{
    public function __construct(
        private readonly SupabaseOrderService $orders,
        private readonly SupabaseAuthService $auth,
        private readonly MidtransService $midtrans,
        private readonly VoucherService $vouchers,
    ) {}

    public function validateVoucher(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'subtotal' => ['required', 'integer', 'min:0'],
            'shippingCost' => ['nullable', 'integer', 'min:0'],
        ]);

        return $this->respond(
            fn () => $this->vouchers->validate(
                $validated['code'],
                (int) $validated['subtotal'],
                (int) ($validated['shippingCost'] ?? 0)
            ),
            200,
            'Voucher validation failed.'
        );
    }

    public function adminAnalytics(Request $request): JsonResponse
    {
        return $this->respond(function () {
            return $this->orders->getAdminAnalytics();
        }, 200, 'Failed to load analytics.');
    }

    /**
     * Process checkout payload and create an order.
     *
     * Supports both authenticated users and guests: resolves the user ID from the
     * Authorization bearer token if present, otherwise proceeds with an anonymous order.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customerName' => ['required', 'string', 'max:255'],
            'customerEmail' => ['required', 'email', 'max:255'],
            'customerPhone' => ['required', 'string', 'max:50'],
            'shippingAddress' => ['required', 'string', 'max:500'],
            'shippingCity' => ['required', 'string', 'max:100'],
            'shippingPostalCode' => ['required', 'string', 'max:20'],
            'courier' => ['required', 'string', 'max:100'],
            'shippingCost' => ['nullable', 'integer', 'min:0'],
            'discountAmount' => ['nullable', 'integer', 'min:0'],
            'voucherCode' => ['nullable', 'string', 'max:50'],
            'paymentMethod' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string'],
            'items.*.slug' => ['required', 'string'],
            'items.*.price' => ['required', 'integer', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        return $this->respond(function () use ($validated, $request) {
            // Attempt to resolve user ID from Bearer token, falling back to guest if omitted or invalid
            $userId = null;
            if ($request->hasHeader('Authorization')) {
                try {
                    $account = $this->auth->accountFromRequest($request);
                    $userId = $account['user']['id'] ?? null;
                } catch (Throwable) {
                    // Anonymous / Guest fallback
                }
            }
            return $this->orders->createOrder($validated, $userId);
        }, 201, 'Order processing failed. Please try again later.');
    }

    public function userOrders(Request $request): JsonResponse
    {
        return $this->respond(function () use ($request) {
            $account = $this->auth->accountFromRequest($request);
            $userId = (string) $account['user']['id'];
            $email = $account['user']['email'] ?? null;

            return $this->orders->getUserOrders($userId, $email);
        }, 200, 'Failed to fetch user orders.');
    }

    public function show(string $orderNumber): JsonResponse
    {
        return $this->respond(function () use ($orderNumber) {
            $order = $this->orders->getOrderByNumber($orderNumber);
            abort_if(! $order, 404, 'Order not found.');
            return $order;
        }, 200, 'Failed to load order.');
    }

    public function cancel(string $orderNumber, Request $request): JsonResponse
    {
        return $this->respond(function () use ($request, $orderNumber) {
            $order = $this->orders->getOrderByNumber($orderNumber);
            abort_if(! $order, 404, 'Order not found.');

            if ($order['orderStatus'] === 'cancelled') {
                return [
                    'message' => 'Order is already cancelled.',
                    'order' => $order,
                ];
            }

            if ($order['orderStatus'] !== 'pending' || $order['paymentStatus'] !== 'unpaid') {
                abort(422, 'Only pending, unpaid orders can be cancelled.');
            }

            if (! empty($order['userId'])) {
                try {
                    $account = $this->auth->accountFromRequest($request);
                    $userId = $account['user']['id'] ?? null;
                    $isAdmin = $account['isAdmin'] ?? false;

                    if ($userId !== $order['userId'] && ! $isAdmin) {
                        abort(403, 'You are not authorized to cancel this order.');
                    }
                } catch (\Throwable $e) {
                    if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                        throw $e;
                    }
                    abort(401, 'Authentication required to cancel this order.');
                }
            }

            $cancelledOrder = $this->orders->updateOrderStatus($order['id'], 'cancelled');

            return [
                'message' => "Order #{$orderNumber} was cancelled and stock returned to catalog.",
                'order' => $cancelledOrder,
            ];
        }, 200, 'Failed to cancel order.');
    }

    public function pay(string $orderNumber, Request $request): JsonResponse
    {
        return $this->respond(function () use ($orderNumber) {
            $order = $this->orders->getOrderByNumber($orderNumber);
            abort_if(! $order, 404, 'Order not found.');

            if ($order['paymentStatus'] === 'paid') {
                abort(422, 'This order is already paid.');
            }

            if ($order['orderStatus'] === 'cancelled') {
                abort(422, 'Cannot pay for a cancelled order.');
            }

            // Append a retry suffix to bypass Midtrans order_id uniqueness constraint
            $retryOrder = $order;
            $retryOrder['orderNumber'] = $order['orderNumber'] . '-R' . time();

            $snapResult = $this->midtrans->createSnapTransaction($retryOrder);

            return [
                'orderNumber' => $orderNumber,
                'snapToken' => $snapResult['snapToken'],
                'redirectUrl' => $snapResult['redirectUrl'],
            ];
        }, 200, 'Failed to initiate payment.');
    }

    public function adminIndex(Request $request): JsonResponse
    {
        return $this->respond(function () use ($request) {
            $status = $request->query('status');
            return $this->orders->getAdminOrders($status);
        }, 200, 'Failed to fetch orders.');
    }

    public function adminUpdateStatus(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,shipped,completed,cancelled'],
            'paymentStatus' => ['nullable', 'string', 'in:unpaid,paid,refunded'],
            'trackingNumber' => ['nullable', 'string', 'max:255'],
        ]);

        return $this->respond(function () use ($id, $validated) {
            return $this->orders->updateOrderStatus(
                $id,
                $validated['status'],
                $validated['paymentStatus'] ?? null,
                $validated['trackingNumber'] ?? null
            );
        }, 200, 'Failed to update order status.');
    }

    /**
     * Purge all orders.
     *
     * Protected by an administrative passcode (defined in config `services.admin.delete_passcode`)
     * to safeguard against accidental bulk data deletion from the admin dashboard.
     */
    public function adminDestroyAll(Request $request): JsonResponse
    {
        $request->validate([
            'passcode' => ['required', 'string'],
        ]);

        return $this->respond(function () use ($request) {
            $passcode = $request->input('passcode');
            $expectedPasscode = config('services.admin.delete_passcode');

            if ($passcode !== $expectedPasscode) {
                abort(422, 'Invalid admin passcode.');
            }

            $this->orders->deleteAllOrders();

            return ['message' => 'All orders have been deleted successfully.'];
        }, 200, 'Failed to delete orders.');
    }

    /**
     * Webhook endpoint handling asynchronous payment status notifications from Midtrans.
     *
     * Validates the SHA-512 notification signature, maps Midtrans transaction/fraud statuses
     * to internal payment (`paid`, `challenge`, `unpaid`, `failed`, `expired`, `cancelled`)
     * and order statuses (`processing`, `pending`, `cancelled`), then updates Supabase accordingly.
     * Returns 200 OK for dashboard test pings and unrecorded test orders to keep Midtrans happy.
     */
    public function midtransNotification(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Received Midtrans notification', ['payload' => $payload]);

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;
        $paymentType = $payload['payment_type'] ?? null;

        // Handle Midtrans Dashboard test pings or empty test requests
        if (! $orderId || ! $transactionStatus) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Midtrans notification webhook endpoint is active.',
            ], 200);
        }

        // Verify digital signature against server key to reject fraudulent or spoofed notifications
        if ($this->midtrans->isConfigured()) {
            $isAqOrder = str_starts_with((string) $orderId, 'AQ-');

            if (empty($payload['signature_key']) || ! $this->midtrans->verifyNotificationSignature($payload)) {
                Log::warning('Invalid or missing Midtrans notification signature key', ['payload' => $payload]);

                // Still return 200 for dummy test order numbers to satisfy dashboard tests if needed
                if (! $isAqOrder) {
                    return response()->json(['status' => 'ok', 'message' => 'Test ping acknowledged'], 200);
                }

                return response()->json(['message' => 'Invalid or missing signature key.'], 403);
            }
        }

        // Map Midtrans transaction lifecycle to internal payment and fulfillment order states
        $paymentStatus = 'unpaid';
        $orderStatus = 'pending';

        if ($transactionStatus === 'capture') {
            if ($paymentType === 'credit_card') {
                if ($fraudStatus === 'challenge') {
                    $paymentStatus = 'challenge';
                    $orderStatus = 'pending';
                } else {
                    $paymentStatus = 'paid';
                    $orderStatus = 'processing';
                }
            } else {
                $paymentStatus = 'paid';
                $orderStatus = 'processing';
            }
        } elseif ($transactionStatus === 'settlement') {
            $paymentStatus = 'paid';
            $orderStatus = 'processing';
        } elseif ($transactionStatus === 'pending') {
            $paymentStatus = 'unpaid';
            $orderStatus = 'pending';
        } elseif ($transactionStatus === 'deny') {
            $paymentStatus = 'failed';
            $orderStatus = 'cancelled';
        } elseif ($transactionStatus === 'expire') {
            $paymentStatus = 'expired';
            $orderStatus = 'cancelled';
        } elseif ($transactionStatus === 'cancel') {
            $paymentStatus = 'cancelled';
            $orderStatus = 'cancelled';
        } elseif (in_array($transactionStatus, ['refund', 'partial_refund'], true)) {
            $paymentStatus = 'refunded';
            $orderStatus = 'cancelled';
        }

        // Strip any retry suffix (e.g., -R169...) to get the original orderNumber
        $originalOrderNumber = preg_replace('/-R\d+$/', '', (string) $orderId);

        // Fetch current order state to prevent late cancellations of paid orders
        $currentOrder = $this->orders->getOrderByNumber($originalOrderNumber);
        if ($currentOrder && $currentOrder['paymentStatus'] === 'paid' && in_array($transactionStatus, ['expire', 'cancel', 'deny'], true)) {
            Log::info("Ignored Midtrans '{$transactionStatus}' notification for already paid order: {$originalOrderNumber}");
            return response()->json([
                'status' => 'ok',
                'message' => "Ignored '{$transactionStatus}' for already paid order.",
            ], 200);
        }

        // Persist the updated payment and order status into Supabase
        $updatedOrder = $this->orders->updateOrderStatusByOrderNumber($originalOrderNumber, $orderStatus, $paymentStatus);

        // Acknowledge unknown or test order IDs with 200 OK so Midtrans stops retry attempts
        if (! $updatedOrder) {
            Log::info("Midtrans webhook notification received for unrecorded or test order_id: {$orderId}. Acknowledging 200 OK.");
            return response()->json([
                'status' => 'ok',
                'message' => "Order '{$orderId}' not found in database, but notification acknowledged.",
                'orderNumber' => $originalOrderNumber,
                'paymentStatus' => $paymentStatus,
                'orderStatus' => $orderStatus,
            ], 200);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payment status updated successfully',
            'data' => [
                'orderNumber' => $orderId,
                'paymentStatus' => $paymentStatus,
                'orderStatus' => $orderStatus,
            ],
        ]);
    }
}

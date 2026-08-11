<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class OrderController extends Controller
{
    public function __construct(
        private readonly SupabaseOrderService $orders,
        private readonly SupabaseAuthService $auth,
    ) {}

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
            'paymentMethod' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string'],
            'items.*.slug' => ['required', 'string'],
            'items.*.price' => ['required', 'integer', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        return $this->respond(function () use ($validated, $request) {
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
        }, 201);
    }

    public function userOrders(Request $request): JsonResponse
    {
        return $this->respond(function () use ($request) {
            $account = $this->auth->accountFromRequest($request);
            $userId = (string) $account['user']['id'];
            $email = $account['user']['email'] ?? null;

            return $this->orders->getUserOrders($userId, $email);
        });
    }

    public function show(string $orderNumber): JsonResponse
    {
        return $this->respond(function () use ($orderNumber) {
            $order = $this->orders->getOrderByNumber($orderNumber);
            abort_if(! $order, 404, 'Order not found.');
            return $order;
        });
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $status = $request->query('status');
        return $this->respond(fn () => $this->orders->getAdminOrders($status));
    }

    public function adminUpdateStatus(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,shipped,completed,cancelled'],
            'paymentStatus' => ['nullable', 'string', 'in:unpaid,paid,refunded'],
        ]);

        return $this->respond(fn () => $this->orders->updateOrderStatus($id, $validated['status'], $validated['paymentStatus'] ?? null));
    }

    private function respond(callable $callback, int $status = 200): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()], $status);
        } catch (Throwable $error) {
            report($error);

            return response()->json([
                'message' => $error->getMessage() ?: 'Order processing failed.',
            ], 500);
        }
    }
}

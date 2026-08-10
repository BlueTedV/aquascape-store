<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class AccountController extends Controller
{
    public function __construct(private readonly SupabaseAuthService $auth) {}

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fullName' => ['nullable', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
        ]);

        return $this->respond(fn () => $this->auth->updateProfile($request, $data));
    }

    public function updateShippingAddress(Request $request): JsonResponse
    {
        $data = $request->validate([
            'recipientName' => ['required', 'string', 'max:160'],
            'phone' => ['required', 'string', 'max:40'],
            'addressLine1' => ['required', 'string', 'max:240'],
            'addressLine2' => ['nullable', 'string', 'max:240'],
            'city' => ['required', 'string', 'max:120'],
            'province' => ['required', 'string', 'max:120'],
            'postalCode' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:80'],
        ]);

        return $this->respond(fn () => $this->auth->updateShippingAddress($request, $data));
    }

    private function respond(callable $callback): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()]);
        } catch (Throwable $error) {
            report($error);

            $statusCode = method_exists($error, 'getStatusCode') ? $error->getStatusCode() : 422;

            return response()->json([
                'message' => $error->getMessage() ?: 'Account request failed.',
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 422);
        }
    }
}
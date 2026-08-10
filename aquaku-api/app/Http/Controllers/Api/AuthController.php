<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Throwable;

class AuthController extends Controller
{
    public function __construct(private readonly SupabaseAuthService $auth) {}

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', Password::min(6)],
            'fullName' => ['required', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
        ]);

        return $this->respond(fn () => $this->auth->signUp(
            $data['email'],
            $data['password'],
            $data['fullName'],
            $data['phone'] ?? null,
        ), 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        return $this->respond(fn () => $this->auth->signIn($data['email'], $data['password']));
    }

    public function me(Request $request): JsonResponse
    {
        return $this->respond(fn () => $this->auth->accountFromRequest($request));
    }

    public function logout(Request $request): JsonResponse
    {
        return $this->respond(function () use ($request) {
            $this->auth->signOut($this->auth->bearerToken($request));

            return ['ok' => true];
        });
    }

    private function respond(callable $callback, int $status = 200): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()], $status);
        } catch (Throwable $error) {
            report($error);

            $statusCode = method_exists($error, 'getStatusCode') ? $error->getStatusCode() : 422;

            return response()->json([
                'message' => $error->getMessage() ?: 'Authentication request failed.',
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 422);
        }
    }
}
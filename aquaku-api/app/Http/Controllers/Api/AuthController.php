<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

/**
 * Manages user authentication and session endpoints.
 *
 * Acts as the API gateway between client authentication requests and Supabase GoTrue Auth,
 * handling registration, password authentication, JWT token refresh, active session resolution,
 * and password recovery workflows.
 */
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

        return $this->respond(
            fn () => $this->auth->signUp(
                $data['email'],
                $data['password'],
                $data['fullName'],
                $data['phone'] ?? null,
            ),
            201,
            'Registration failed. Please check your details and try again.'
        );
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        return $this->respond(
            fn () => $this->auth->signIn($data['email'], $data['password']),
            200,
            'Invalid email or password.'
        );
    }

    public function refresh(Request $request): JsonResponse
    {
        $data = $request->validate([
            'refreshToken' => ['required', 'string'],
        ]);

        return $this->respond(
            fn () => $this->auth->refresh($data['refreshToken']),
            200,
            'Failed to refresh session.'
        );
    }

    /**
     * Retrieve the currently authenticated user's profile and default shipping address
     * resolved from the Bearer token in the request header.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->respond(
            fn () => $request->attributes->get('account') ?? $this->auth->accountFromRequest($request),
            200,
            'Authentication session expired. Please log in again.'
        );
    }

    public function logout(Request $request): JsonResponse
    {
        return $this->respond(function () use ($request) {
            $this->auth->signOut($this->auth->bearerToken($request));

            return ['ok' => true];
        }, 200, 'Failed to log out.');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        return $this->respond(
            fn () => $this->auth->forgotPassword($data['email']),
            200,
            'Failed to send password reset link.'
        );
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', Password::min(6)],
        ]);

        return $this->respond(
            fn () => $this->auth->resetPassword($data['email'], $data['password']),
            200,
            'Failed to reset password.'
        );
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function __construct(private readonly SupabaseAuthService $auth) {}

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fullName' => ['nullable', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
        ]);

        return $this->respond(
            fn () => $this->auth->updateProfile($request, $data),
            200,
            'Failed to update profile. Please try again.'
        );
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

        return $this->respond(
            fn () => $this->auth->updateShippingAddress($request, $data),
            200,
            'Failed to update shipping address. Please try again.'
        );
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabasePromoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function __construct(
        private readonly SupabasePromoService $promos,
        private readonly SupabaseAuthService $auth,
    ) {}

    public function adminIndex(Request $request): JsonResponse
    {
        return $this->respond(
            fn () => $this->promos->getPromos(),
            200,
            'Failed to retrieve promos.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', 'in:percentage,fixed,shipping'],
            'value' => ['required', 'integer', 'min:1'],
            'maxDiscount' => ['nullable', 'integer', 'min:0'],
            'minSubtotal' => ['nullable', 'integer', 'min:0'],
            'description' => ['required', 'string', 'max:500'],
        ]);

        return $this->respond(
            fn () => $this->promos->createPromo($validated),
            201,
            'Failed to create promo.'
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        return $this->respond(fn () => [
            'deleted' => $this->promos->deletePromo($id),
        ], 200, 'Failed to delete promo.');
    }
}

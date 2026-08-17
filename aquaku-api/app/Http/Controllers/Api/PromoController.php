<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabasePromoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PromoController extends Controller
{
    public function __construct(
        private readonly SupabasePromoService $promos,
        private readonly SupabaseAuthService $auth,
    ) {}

    public function adminIndex(Request $request): JsonResponse
    {
        $this->auth->requireAdmin($request);

        return $this->respond(fn () => $this->promos->getPromos());
    }

    public function store(Request $request): JsonResponse
    {
        $this->auth->requireAdmin($request);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', 'in:percentage,fixed,shipping'],
            'value' => ['required', 'integer', 'min:1'],
            'maxDiscount' => ['nullable', 'integer', 'min:0'],
            'minSubtotal' => ['nullable', 'integer', 'min:0'],
            'description' => ['required', 'string', 'max:500'],
        ]);

        return $this->respond(fn () => $this->promos->createPromo($validated), 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->auth->requireAdmin($request);

        return $this->respond(fn () => [
            'deleted' => $this->promos->deletePromo($id),
        ]);
    }

    private function respond(callable $callback, int $status = 200): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()], $status);
        } catch (Throwable $error) {
            report($error);

            $statusCode = method_exists($error, 'getStatusCode') ? $error->getStatusCode() : 500;

            return response()->json([
                'message' => $error->getMessage() ?: 'Promo service error.',
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 500);
        }
    }
}

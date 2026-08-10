<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ProductController extends Controller
{
    public function __construct(private readonly SupabaseCatalogService $catalog) {}

    public function index(): JsonResponse
    {
        return $this->respond(fn () => $this->catalog->products());
    }

    public function featured(Request $request): JsonResponse
    {
        $limit = min(12, max(1, (int) $request->integer('limit', 4)));

        return $this->respond(fn () => $this->catalog->featured($limit));
    }

    public function show(string $slug): JsonResponse
    {
        return $this->respond(function () use ($slug) {
            $product = $this->catalog->product($slug);

            abort_if(! $product, 404, 'Product not found.');

            return $product;
        });
    }

    public function related(string $slug, Request $request): JsonResponse
    {
        $limit = min(12, max(1, (int) $request->integer('limit', 4)));

        return $this->respond(fn () => $this->catalog->related($slug, $limit));
    }

    public function categories(): JsonResponse
    {
        return $this->respond(fn () => $this->catalog->categories());
    }

    private function respond(callable $callback): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()]);
        } catch (Throwable $error) {
            report($error);

            return response()->json([
                'message' => 'Catalog service unavailable.',
            ], 503);
        }
    }
}

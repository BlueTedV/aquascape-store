<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public catalog controller for product discovery.
 *
 * Serves active products, featured items, category filters, product details,
 * and related item recommendations to the store storefront.
 */
class ProductController extends Controller
{
    public function __construct(private readonly SupabaseCatalogService $catalog) {}

    public function index(Request $request): JsonResponse
    {
        return $this->respond(
            fn () => $this->catalog->products($request->all()),
            200,
            'Catalog service is currently unavailable.'
        );
    }

    public function featured(Request $request): JsonResponse
    {
        $limit = min(12, max(1, (int) $request->integer('limit', 4)));

        return $this->respond(
            fn () => $this->catalog->featured($limit),
            200,
            'Catalog service is currently unavailable.'
        );
    }

    public function show(string $slug): JsonResponse
    {
        return $this->respond(function () use ($slug) {
            $product = $this->catalog->product($slug);

            abort_if(! $product, 404, 'Product not found.');

            return $product;
        }, 200, 'Catalog service is currently unavailable.');
    }

    public function related(string $slug, Request $request): JsonResponse
    {
        $limit = min(12, max(1, (int) $request->integer('limit', 4)));

        return $this->respond(
            fn () => $this->catalog->related($slug, $limit),
            200,
            'Catalog service is currently unavailable.'
        );
    }

    public function categories(): JsonResponse
    {
        return $this->respond(
            fn () => $this->catalog->categories(),
            200,
            'Catalog service is currently unavailable.'
        );
    }
}

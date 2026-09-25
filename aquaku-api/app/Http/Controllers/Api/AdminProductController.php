<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Administrative controller for catalog management.
 *
 * All operations require admin privileges verified against Supabase user roles.
 * Provides product creation, modification, deletion, and protected bulk wipe capabilities.
 */
class AdminProductController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $auth,
        private readonly SupabaseCatalogService $catalog,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return $this->respond(function () {
            return $this->catalog->adminProducts();
        }, 200, 'Failed to fetch admin products.');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedProduct($request);

        return $this->respond(function () use ($data) {
            return $this->catalog->createProduct($data);
        }, 201, 'Failed to create product.');
    }

    public function update(string $id, Request $request): JsonResponse
    {
        $data = $this->validatedProduct($request);

        return $this->respond(function () use ($id, $data) {
            return $this->catalog->updateProduct($id, $data);
        }, 200, 'Failed to update product.');
    }

    public function destroy(string $id, Request $request): JsonResponse
    {
        return $this->respond(function () use ($id) {
            $this->catalog->deleteProduct($id);

            return ['message' => 'Product deleted successfully.'];
        }, 200, 'Failed to delete product.');
    }

    /**
     * Purge all products from the catalog.
     *
     * Gated by a required passcode configuration (`services.admin.delete_passcode`)
     * to prevent unintended catalog wipes from the admin panel.
     */
    public function destroyAll(Request $request): JsonResponse
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

            $this->catalog->deleteAllProducts();

            return ['message' => 'All products have been deleted successfully.'];
        }, 200, 'Failed to delete all products.');
    }

    private function validatedProduct(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'slug' => ['nullable', 'string', 'max:180'],
            'categorySlug' => ['required', 'string', 'max:80'],
            'collection' => ['required', 'string', 'max:120'],
            'brand' => ['required', 'string', 'max:120'],
            'price' => ['required', 'integer', 'min:0'],
            'compareAtPrice' => ['nullable', 'integer', 'min:0'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviewCount' => ['nullable', 'integer', 'min:0'],
            'image' => ['required', 'string', 'max:600'],
            'badge' => ['nullable', Rule::in(['New', 'Best Seller', 'Premium'])],
            'featured' => ['boolean'],
            'stock' => ['required', 'integer', 'min:0'],
            'onSale' => ['boolean'],
            'unit' => ['nullable', 'string', 'max:40'],
            'arrival' => ['boolean'],
            'tags' => ['array'],
            'tags.*' => ['string', 'max:40'],
            'description' => ['nullable', 'string'],
            'gallery' => ['array'],
            'gallery.*' => ['string', 'max:600'],
            'specs' => ['array'],
            'specs.*.label' => ['nullable', 'string', 'max:80'],
            'specs.*.value' => ['nullable', 'string', 'max:240'],
        ]);
    }
}
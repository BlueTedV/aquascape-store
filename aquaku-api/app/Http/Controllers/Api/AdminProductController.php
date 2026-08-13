<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class AdminProductController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $auth,
        private readonly SupabaseCatalogService $catalog,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return $this->respond(function () use ($request) {
            $this->auth->requireAdmin($request);

            return $this->catalog->adminProducts();
        });
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedProduct($request);

        return $this->respond(function () use ($request, $data) {
            $this->auth->requireAdmin($request);

            return $this->catalog->createProduct($data);
        }, 201);
    }

    public function update(string $id, Request $request): JsonResponse
    {
        $data = $this->validatedProduct($request);

        return $this->respond(function () use ($request, $id, $data) {
            $this->auth->requireAdmin($request);

            return $this->catalog->updateProduct($id, $data);
        });
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $request->validate([
            'passcode' => ['required', 'string'],
        ]);

        return $this->respond(function () use ($request) {
            $this->auth->requireAdmin($request);

            $passcode = $request->input('passcode');
            $expectedPasscode = config('services.admin.delete_passcode');

            if ($passcode !== $expectedPasscode) {
                abort(422, 'Invalid admin passcode.');
            }

            $this->catalog->deleteAllProducts();

            return ['message' => 'All products have been deleted successfully.'];
        });
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

    private function respond(callable $callback, int $status = 200): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()], $status);
        } catch (Throwable $error) {
            report($error);

            $statusCode = method_exists($error, 'getStatusCode') ? $error->getStatusCode() : 422;

            return response()->json([
                'message' => $error->getMessage() ?: 'Admin product request failed.',
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 422);
        }
    }
}
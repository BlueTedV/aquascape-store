<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class AdminUploadController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $auth,
        private readonly SupabaseStorageService $storage,
    ) {}

    public function image(Request $request): JsonResponse
    {
        $data = $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        return $this->respond(function () use ($request, $data) {
            $this->auth->requireAdmin($request);

            return $this->storage->uploadProductImage($data['image']);
        }, 201);
    }

    private function respond(callable $callback, int $status = 200): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()], $status);
        } catch (Throwable $error) {
            report($error);

            $statusCode = method_exists($error, 'getStatusCode') ? $error->getStatusCode() : 422;

            return response()->json([
                'message' => $error->getMessage() ?: 'Image upload failed.',
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 422);
        }
    }
}
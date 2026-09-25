<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Handles media uploads for the admin panel.
 *
 * Validates binary image assets and pushes them to the configured Supabase Storage bucket,
 * returning the public CDN URL to attach to products or banners.
 */
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
        }, 201, 'Image upload failed. Please try again.');
    }
}
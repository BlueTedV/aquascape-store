<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseGalleryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class GalleryController extends Controller
{
    public function __construct(
        private readonly SupabaseGalleryService $gallery,
        private readonly SupabaseAuthService $auth,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $sort = $request->string('sort', 'top')->value();
        $limit = min(30, max(1, (int) $request->integer('limit', 12)));

        return $this->respond(fn () => $this->gallery->getPosts($sort, $limit));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'tankSpecs' => ['nullable', 'string', 'max:500'],
            'image' => ['required', 'string'],
            'size' => ['nullable', 'string', 'in:tall,wide,square'],
        ]);

        $userId = null;
        $userName = null;

        if ($request->hasHeader('Authorization')) {
            try {
                $account = $this->auth->accountFromRequest($request);
                $userId = $account['user']['id'] ?? null;
                $userName = $account['user']['user_metadata']['name'] ?? $account['user']['email'] ?? null;
            } catch (Throwable) {
                // Anonymous fallback
            }
        }

        return $this->respond(fn () => $this->gallery->createPost($validated, $userId, $userName), 201);
    }

    public function like(string $id): JsonResponse
    {
        return $this->respond(fn () => $this->gallery->likePost($id));
    }

    private function respond(callable $callback, int $status = 200): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()], $status);
        } catch (Throwable $error) {
            report($error);

            return response()->json([
                'message' => $error->getMessage() ?: 'Gallery service error.',
            ], 500);
        }
    }
}

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
        $userId = null;

        if ($request->hasHeader('Authorization')) {
            try {
                $account = $this->auth->accountFromRequest($request);
                $userId = $account['user']['id'] ?? null;
            } catch (Throwable) {
                // Anonymous guest
            }
        }

        return $this->respond(
            fn () => $this->gallery->getPosts($sort, $limit, $userId),
            200,
            'Failed to retrieve gallery posts.'
        );
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
                $userName = $account['user']['fullName'] ?? $account['profile']['fullName'] ?? $account['user']['email'] ?? null;
            } catch (Throwable) {
                // Anonymous fallback
            }
        }

        return $this->respond(
            fn () => $this->gallery->createPost($validated, $userId, $userName),
            201,
            'Failed to share gallery post.'
        );
    }

    public function like(Request $request, string $id): JsonResponse
    {
        $account = $this->auth->accountFromRequest($request);
        $userId = (string) $account['user']['id'];

        return $this->respond(
            fn () => $this->gallery->toggleLikePost($id, $userId),
            200,
            'Failed to update like on gallery post.'
        );
    }

    public function comments(string $id, Request $request): JsonResponse
    {
        $userId = null;
        if ($request->hasHeader('Authorization')) {
            try {
                $account = $this->auth->accountFromRequest($request);
                $userId = $account['user']['id'] ?? null;
            } catch (Throwable) {
                // Anonymous guest
            }
        }

        return $this->respond(
            fn () => $this->gallery->getComments($id, $userId),
            200,
            'Failed to retrieve comments.'
        );
    }

    public function storeComment(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:1000'],
            'authorName' => ['nullable', 'string', 'max:80'],
        ]);

        $userId = null;
        $userName = null;

        if ($request->hasHeader('Authorization')) {
            try {
                $account = $this->auth->accountFromRequest($request);
                $userId = $account['user']['id'] ?? null;
                $userName = $account['user']['fullName'] ?? $account['profile']['fullName'] ?? $account['user']['email'] ?? null;
            } catch (Throwable) {
                // Anonymous fallback
            }
        }

        return $this->respond(
            fn () => $this->gallery->createComment($id, $validated, $userId, $userName),
            201,
            'Failed to post comment.'
        );
    }

    public function destroyComment(string $commentId, Request $request): JsonResponse
    {
        $account = $this->auth->accountFromRequest($request);
        $userId = (string) $account['user']['id'];
        $isAdmin = (bool) ($account['isAdmin'] ?? false);

        return $this->respond(
            function () use ($commentId, $userId, $isAdmin) {
                $this->gallery->deleteComment($commentId, $userId, $isAdmin);
                return ['message' => 'Comment deleted successfully.'];
            },
            200,
            'Failed to delete comment.'
        );
    }

    public function adminIndex(Request $request): JsonResponse
    {
        return $this->respond(
            fn () => $this->gallery->getAdminPosts(),
            200,
            'Failed to retrieve admin gallery posts.'
        );
    }

    public function adminDestroy(string $id): JsonResponse
    {
        return $this->respond(
            function () use ($id) {
                $this->gallery->deletePost($id);
                return ['message' => 'Gallery showcase post deleted successfully.'];
            },
            200,
            'Failed to delete gallery post.'
        );
    }

    public function adminDestroyComment(string $commentId): JsonResponse
    {
        return $this->respond(
            function () use ($commentId) {
                $this->gallery->deleteComment($commentId, null, true);
                return ['message' => 'Comment deleted successfully.'];
            },
            200,
            'Failed to delete comment.'
        );
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ReviewController extends Controller
{
    public function __construct(
        private readonly SupabaseReviewService $reviews,
        private readonly SupabaseAuthService $auth,
    ) {}

    public function index(string $slug): JsonResponse
    {
        return $this->respond(fn () => $this->reviews->getReviewsForProduct($slug));
    }

    public function store(string $slug, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'userName' => ['required', 'string', 'max:100'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'max:2000'],
        ]);

        $userId = null;
        if ($request->hasHeader('Authorization')) {
            try {
                $account = $this->auth->accountFromRequest($request);
                $userId = $account['user']['id'] ?? null;
            } catch (Throwable) {
                // Anonymous fallback
            }
        }

        return $this->respond(fn () => $this->reviews->createReview($slug, $validated, $userId), 201);
    }

    private function respond(callable $callback, int $status = 200): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()], $status);
        } catch (Throwable $error) {
            report($error);

            return response()->json([
                'message' => $error->getMessage() ?: 'Review action failed.',
            ], 500);
        }
    }
}

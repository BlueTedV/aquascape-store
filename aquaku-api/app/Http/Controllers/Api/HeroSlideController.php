<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseHeroSlideService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class HeroSlideController extends Controller
{
    public function __construct(
        private readonly SupabaseHeroSlideService $heroSlides,
        private readonly SupabaseAuthService $auth,
    ) {}

    public function index(): JsonResponse
    {
        return $this->respond(fn () => $this->heroSlides->getSlides());
    }

    public function store(Request $request): JsonResponse
    {
        $this->auth->requireAdmin($request);

        $validated = $request->validate([
            'eyebrow' => ['required', 'string', 'max:100'],
            'title' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:500'],
            'cta' => ['required', 'string', 'max:50'],
            'filter' => ['required', 'string', 'max:50'],
            'image' => ['required', 'string'],
        ]);

        return $this->respond(fn () => $this->heroSlides->createSlide($validated), 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->auth->requireAdmin($request);

        return $this->respond(fn () => [
            'deleted' => $this->heroSlides->deleteSlide($id),
        ]);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $this->auth->requireAdmin($request);

        return $this->respond(fn () => [
            'deleted' => $this->heroSlides->deleteAllSlides(),
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
                'message' => $error->getMessage() ?: 'Hero slide service error.',
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 500);
        }
    }
}

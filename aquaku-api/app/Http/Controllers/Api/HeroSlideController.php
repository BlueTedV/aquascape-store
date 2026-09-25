<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use App\Services\SupabaseHeroSlideService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HeroSlideController extends Controller
{
    public function __construct(
        private readonly SupabaseHeroSlideService $heroSlides,
        private readonly SupabaseAuthService $auth,
    ) {}

    public function index(): JsonResponse
    {
        return $this->respond(
            fn () => $this->heroSlides->getSlides(),
            200,
            'Failed to retrieve hero slides.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'eyebrow' => ['required', 'string', 'max:100'],
            'title' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:500'],
            'cta' => ['required', 'string', 'max:50'],
            'filter' => ['required', 'string', 'max:50'],
            'image' => ['required', 'string'],
        ]);

        return $this->respond(
            fn () => $this->heroSlides->createSlide($validated),
            201,
            'Failed to create hero slide.'
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        return $this->respond(fn () => [
            'deleted' => $this->heroSlides->deleteSlide($id),
        ], 200, 'Failed to delete hero slide.');
    }

    public function destroyAll(Request $request): JsonResponse
    {
        return $this->respond(fn () => [
            'deleted' => $this->heroSlides->deleteAllSlides(),
        ], 200, 'Failed to delete all hero slides.');
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseArticleService;
use App\Services\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function __construct(
        private readonly SupabaseArticleService $articles,
        private readonly SupabaseAuthService $auth,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $request->query('q') ?? $request->query('query');
        $category = $request->query('category');

        return $this->respond(
            fn () => $this->articles->getArticles($query, $category, true),
            200,
            'Failed to retrieve articles.'
        );
    }

    public function show(string $slug): JsonResponse
    {
        return $this->respond(function () use ($slug) {
            $article = $this->articles->getArticle($slug);
            abort_if(! $article, 404, 'Article not found.');

            return $article;
        }, 200, 'Failed to retrieve article.');
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $query = $request->query('q') ?? $request->query('query');
        $category = $request->query('category');

        return $this->respond(
            fn () => $this->articles->getArticles($query, $category, false),
            200,
            'Failed to retrieve articles for admin.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'summary' => ['required', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
            'author' => ['nullable', 'string', 'max:150'],
            'readTime' => ['nullable', 'string', 'max:50'],
            'read_time' => ['nullable', 'string', 'max:50'],
            'isPublished' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ]);

        return $this->respond(
            fn () => $this->articles->createArticle($validated),
            201,
            'Failed to create article.'
        );
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:100'],
            'summary' => ['sometimes', 'string', 'max:1000'],
            'content' => ['sometimes', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
            'author' => ['nullable', 'string', 'max:150'],
            'readTime' => ['nullable', 'string', 'max:50'],
            'read_time' => ['nullable', 'string', 'max:50'],
            'isPublished' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ]);

        return $this->respond(
            fn () => $this->articles->updateArticle($id, $validated),
            200,
            'Failed to update article.'
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        return $this->respond(fn () => [
            'deleted' => $this->articles->deleteArticle($id),
        ], 200, 'Failed to delete article.');
    }
}

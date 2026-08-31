<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseArticleService;
use App\Services\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

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

        return $this->respond(fn () => $this->articles->getArticles($query, $category, true));
    }

    public function show(string $slug): JsonResponse
    {
        return $this->respond(function () use ($slug) {
            $article = $this->articles->getArticle($slug);
            abort_if(! $article, 404, 'Article not found.');

            return $article;
        });
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $this->auth->requireAdmin($request);
        $query = $request->query('q') ?? $request->query('query');
        $category = $request->query('category');

        return $this->respond(fn () => $this->articles->getArticles($query, $category, false));
    }

    public function store(Request $request): JsonResponse
    {
        $this->auth->requireAdmin($request);

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

        return $this->respond(fn () => $this->articles->createArticle($validated), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $this->auth->requireAdmin($request);

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

        return $this->respond(fn () => $this->articles->updateArticle($id, $validated));
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->auth->requireAdmin($request);

        return $this->respond(fn () => [
            'deleted' => $this->articles->deleteArticle($id),
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
                'message' => $error->getMessage() ?: 'Article service error.',
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 500);
        }
    }
}

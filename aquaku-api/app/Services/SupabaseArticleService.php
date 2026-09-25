<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class SupabaseArticleService
{
    private string $url;

    private string $key;

    public function __construct()
    {
        $this->url = rtrim((string) config('services.supabase.url'), '/');
        $this->key = (string) config('services.supabase.key');

        if ($this->url === '' || $this->key === '') {
            throw new RuntimeException('Supabase API configuration is missing.');
        }
    }

    public function articleVersion(): int
    {
        return (int) Cache::get('articles_version', 1);
    }

    public function clearArticleCache(): void
    {
        Cache::increment('articles_version');
    }

    public function getArticles(?string $query = null, ?string $category = null, bool $publishedOnly = true): array
    {
        $v = $this->articleVersion();
        $cacheKey = "articles_v{$v}_" . md5(json_encode([$query, $category, $publishedOnly]));

        return Cache::remember($cacheKey, 600, function () use ($query, $category, $publishedOnly) {
            $params = [
                'select' => '*',
                'order' => 'featured.desc,created_at.desc',
            ];

            if ($publishedOnly) {
                $params['is_published'] = 'eq.true';
            }

            if ($category && $category !== 'All') {
                $params['category'] = "eq.{$category}";
            }

            $rows = $this->request()
                ->get('/rest/v1/articles', $params)
                ->throw()
                ->json();

            $collection = collect($rows)->map(fn (array $row) => $this->mapArticle($row));

            if ($query && trim($query) !== '') {
                $q = mb_strtolower(trim($query));
                $collection = $collection->filter(function (array $item) use ($q) {
                    return Str::contains(mb_strtolower($item['title']), $q)
                        || Str::contains(mb_strtolower($item['summary']), $q)
                        || Str::contains(mb_strtolower($item['category']), $q)
                        || collect($item['tags'])->some(fn ($t) => Str::contains(mb_strtolower((string) $t), $q));
                })->values();
            }

            return $collection->all();
        });
    }

    public function getArticle(string $slug): ?array
    {
        $v = $this->articleVersion();

        return Cache::remember("article_v{$v}_{$slug}", 600, function () use ($slug) {
            $rows = $this->request()
                ->get('/rest/v1/articles', [
                    'select' => '*',
                    'slug' => "eq.{$slug}",
                    'limit' => 1,
                ])
                ->throw()
                ->json();

            if (empty($rows)) {
                return null;
            }

            return $this->mapArticle($rows[0]);
        });
    }

    public function createArticle(array $payload): array
    {
        $title = trim((string) ($payload['title'] ?? ''));
        $slug = trim((string) ($payload['slug'] ?? ''));

        if ($slug === '') {
            $slug = Str::slug($title);
        } else {
            $slug = Str::slug($slug);
        }

        $summary = trim((string) ($payload['summary'] ?? ''));
        $content = trim((string) ($payload['content'] ?? ''));
        $category = trim((string) ($payload['category'] ?? 'General Help'));
        $author = trim((string) ($payload['author'] ?? 'Aquaku Specialist'));
        $readTime = trim((string) ($payload['readTime'] ?? $payload['read_time'] ?? '3 min read'));
        $isPublished = (bool) ($payload['isPublished'] ?? $payload['is_published'] ?? true);
        $featured = (bool) ($payload['featured'] ?? false);
        $tags = is_array($payload['tags'] ?? null) ? $payload['tags'] : [];

        $insertData = [
            'slug' => $slug,
            'title' => $title,
            'summary' => $summary,
            'content' => $content,
            'category' => $category,
            'author' => $author,
            'read_time' => $readTime,
            'is_published' => $isPublished,
            'featured' => $featured,
            'tags' => $tags,
            'created_at' => now()->toIso8601String(),
            'updated_at' => now()->toIso8601String(),
        ];

        $insertedRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/articles', $insertData)
            ->throw()
            ->json();

        $this->clearArticleCache();

        $row = $insertedRows[0] ?? $insertedRows;

        return $this->mapArticle($row);
    }

    public function updateArticle(string $id, array $payload): array
    {
        $updateData = [];

        if (isset($payload['title'])) {
            $updateData['title'] = trim((string) $payload['title']);
        }
        if (isset($payload['slug'])) {
            $updateData['slug'] = Str::slug((string) $payload['slug']);
        }
        if (isset($payload['summary'])) {
            $updateData['summary'] = trim((string) $payload['summary']);
        }
        if (isset($payload['content'])) {
            $updateData['content'] = trim((string) $payload['content']);
        }
        if (isset($payload['category'])) {
            $updateData['category'] = trim((string) $payload['category']);
        }
        if (isset($payload['author'])) {
            $updateData['author'] = trim((string) $payload['author']);
        }
        if (isset($payload['readTime']) || isset($payload['read_time'])) {
            $updateData['read_time'] = trim((string) ($payload['readTime'] ?? $payload['read_time']));
        }
        if (isset($payload['isPublished']) || isset($payload['is_published'])) {
            $updateData['is_published'] = (bool) ($payload['isPublished'] ?? $payload['is_published']);
        }
        if (isset($payload['featured'])) {
            $updateData['featured'] = (bool) $payload['featured'];
        }
        if (isset($payload['tags']) && is_array($payload['tags'])) {
            $updateData['tags'] = $payload['tags'];
        }

        $updateData['updated_at'] = now()->toIso8601String();

        $updatedRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->withQueryParameters(['id' => "eq.{$id}"])
            ->patch('/rest/v1/articles', $updateData)
            ->throw()
            ->json();

        $this->clearArticleCache();

        $row = $updatedRows[0] ?? $updatedRows;

        return $this->mapArticle($row);
    }

    public function deleteArticle(string $id): bool
    {
        $this->request()
            ->withQueryParameters(['id' => "eq.{$id}"])
            ->delete('/rest/v1/articles')
            ->throw();

        $this->clearArticleCache();

        return true;
    }

    private function mapArticle(array $row): array
    {
        return [
            'id' => (string) ($row['id'] ?? ''),
            'slug' => (string) ($row['slug'] ?? ''),
            'title' => (string) ($row['title'] ?? ''),
            'category' => (string) ($row['category'] ?? 'General Help'),
            'summary' => (string) ($row['summary'] ?? ''),
            'content' => (string) ($row['content'] ?? ''),
            'tags' => (array) ($row['tags'] ?? []),
            'author' => (string) ($row['author'] ?? 'Aquaku Specialist'),
            'readTime' => (string) ($row['read_time'] ?? '3 min read'),
            'isPublished' => (bool) ($row['is_published'] ?? true),
            'featured' => (bool) ($row['featured'] ?? false),
            'createdAt' => (string) ($row['created_at'] ?? now()->toIso8601String()),
            'updatedAt' => (string) ($row['updated_at'] ?? now()->toIso8601String()),
        ];
    }

    private function request(): PendingRequest
    {
        return Http::baseUrl($this->url)
            ->acceptJson()
            ->withHeaders([
                'apikey' => $this->key,
                'Authorization' => "Bearer {$this->key}",
            ]);
    }
}

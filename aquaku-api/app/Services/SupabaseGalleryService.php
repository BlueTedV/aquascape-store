<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SupabaseGalleryService
{
    private string $url;

    private string $key;

    public function __construct(
        private readonly SupabaseStorageService $storage,
    ) {
        $this->url = rtrim((string) config('services.supabase.url'), '/');
        $this->key = (string) config('services.supabase.key');

        if ($this->url === '' || $this->key === '') {
            throw new RuntimeException('Supabase API configuration is missing.');
        }
    }

    public function getPosts(string $sort = 'top', int $limit = 12): array
    {
        $order = $sort === 'latest' ? 'created_at.desc' : 'likes_count.desc,created_at.desc';

        $rows = $this->request()
            ->get('/rest/v1/gallery_posts', [
                'select' => '*',
                'order' => $order,
                'limit' => $limit,
            ])
            ->throw()
            ->json();

        return collect($rows)->map(fn (array $row) => $this->mapPost($row))->all();
    }

    public function createPost(array $payload, ?string $userId = null, ?string $userName = null): array
    {
        $authorName = trim((string) ($userName ?? $payload['authorName'] ?? 'Aquascaper'));
        $title = trim((string) ($payload['title'] ?? 'My Aquascape Creation'));
        $description = trim((string) ($payload['description'] ?? ''));
        $tankSpecs = trim((string) ($payload['tankSpecs'] ?? ''));
        $rawImage = trim((string) ($payload['image'] ?? $payload['imageUrl'] ?? ''));
        $size = in_array($payload['size'] ?? '', ['tall', 'wide', 'square'], true) ? $payload['size'] : 'wide';

        $imageUrl = $rawImage !== '' ? $this->storage->uploadBase64Image($rawImage, 'gallery') : '/images/home/gallery-1.svg';

        $insertData = [
            'user_id' => $userId,
            'author_name' => $authorName !== '' ? $authorName : 'Anonymous Scaper',
            'title' => $title,
            'description' => $description,
            'tank_specs' => $tankSpecs,
            'image_url' => $imageUrl,
            'size' => $size,
            'likes_count' => 0,
        ];

        $insertedRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/gallery_posts', $insertData)
            ->throw()
            ->json();

        $row = $insertedRows[0] ?? $insertedRows;

        return $this->mapPost($row);
    }

    public function likePost(string $id): array
    {
        // 1. Fetch current post
        $rows = $this->request()
            ->get('/rest/v1/gallery_posts', [
                'select' => '*',
                'id' => "eq.{$id}",
                'limit' => 1,
            ])
            ->throw()
            ->json();

        $post = $rows[0] ?? null;
        abort_if(! is_array($post), 404, 'Gallery post not found.');

        $newCount = ((int) ($post['likes_count'] ?? 0)) + 1;

        // 2. Update likes_count
        $updatedRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->withQueryParameters(['id' => 'eq.' . $id])
            ->patch('/rest/v1/gallery_posts', [
                'likes_count' => $newCount,
            ])
            ->throw()
            ->json();

        $updated = $updatedRows[0] ?? $post;
        $updated['likes_count'] = $newCount;

        return $this->mapPost($updated);
    }

    private function mapPost(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'title' => (string) ($row['title'] ?? 'Aquascape Showcase'),
            'authorName' => (string) ($row['author_name'] ?? 'Aquascaper'),
            'description' => (string) ($row['description'] ?? ''),
            'tankSpecs' => (string) ($row['tank_specs'] ?? ''),
            'image' => (string) ($row['image_url'] ?? '/images/home/gallery-1.svg'),
            'size' => (string) ($row['size'] ?? 'wide'),
            'likesCount' => (int) ($row['likes_count'] ?? 0),
            'createdAt' => (string) ($row['created_at'] ?? now()->toIso8601String()),
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

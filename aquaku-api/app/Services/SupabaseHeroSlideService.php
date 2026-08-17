<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SupabaseHeroSlideService
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

    public function getSlides(): array
    {
        $rows = $this->request()
            ->get('/rest/v1/hero_slides', [
                'select' => '*',
                'order' => 'created_at.asc',
            ])
            ->throw()
            ->json();

        return collect($rows)->map(fn (array $row) => $this->mapSlide($row))->all();
    }

    public function createSlide(array $payload): array
    {
        $eyebrow = trim((string) ($payload['eyebrow'] ?? 'Special Offer'));
        $title = trim((string) ($payload['title'] ?? 'New Aquascape Promotion'));
        $body = trim((string) ($payload['body'] ?? ''));
        $cta = trim((string) ($payload['cta'] ?? 'Shop Now'));
        $filter = trim((string) ($payload['filter'] ?? 'all'));
        $rawImage = trim((string) ($payload['image'] ?? $payload['imageUrl'] ?? ''));

        $imageUrl = $rawImage !== '' ? $this->storage->uploadBase64Image($rawImage, 'hero-slides') : '/images/home/promo-sale.svg';

        $insertData = [
            'eyebrow' => $eyebrow,
            'title' => $title,
            'body' => $body,
            'cta' => $cta,
            'filter' => $filter,
            'image_url' => $imageUrl,
        ];

        $insertedRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/hero_slides', $insertData)
            ->throw()
            ->json();

        $row = $insertedRows[0] ?? $insertedRows;

        return $this->mapSlide($row);
    }

    public function deleteSlide(string $id): bool
    {
        $this->request()
            ->withQueryParameters(['id' => "eq.{$id}"])
            ->delete('/rest/v1/hero_slides')
            ->throw();

        return true;
    }

    public function deleteAllSlides(): bool
    {
        $this->request()
            ->withQueryParameters(['id' => 'not.is.null'])
            ->delete('/rest/v1/hero_slides')
            ->throw();

        return true;
    }

    private function mapSlide(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'eyebrow' => (string) ($row['eyebrow'] ?? 'Special Offer'),
            'title' => (string) ($row['title'] ?? 'Promo Title'),
            'body' => (string) ($row['body'] ?? ''),
            'cta' => (string) ($row['cta'] ?? 'Shop Now'),
            'filter' => (string) ($row['filter'] ?? 'all'),
            'image' => (string) ($row['image_url'] ?? '/images/home/promo-sale.svg'),
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

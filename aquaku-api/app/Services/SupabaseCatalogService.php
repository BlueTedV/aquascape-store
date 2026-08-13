<?php

namespace App\Services;

use App\Support\ProductContent;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class SupabaseCatalogService
{
    private string $url;

    private string $key;

    public function __construct()
    {
        $this->url = rtrim((string) config('services.supabase.url'), '/');
        $this->key = (string) config('services.supabase.key');

        if ($this->url === '' || $this->key === '') {
            throw new RuntimeException('Supabase API configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_PUBLISHABLE_KEY in Laravel .env.');
        }
    }

    public function products(): array
    {
        $rows = $this->request()
            ->get('/rest/v1/products', [
                'select' => '*',
                'order' => 'featured.desc,review_count.desc',
            ])
            ->throw()
            ->json();

        return collect($rows)->map(fn (array $row) => $this->mapProduct($row))->all();
    }

    public function adminProducts(): array
    {
        $rows = $this->request()
            ->get('/rest/v1/products', [
                'select' => '*',
                'order' => 'created_at.desc',
            ])
            ->throw()
            ->json();

        return collect($rows)->map(fn (array $row) => $this->mapProductDetail($row))->all();
    }

    public function featured(int $limit = 4): array
    {
        $rows = $this->request()
            ->get('/rest/v1/products', [
                'select' => '*',
                'featured' => 'eq.true',
                'order' => 'review_count.desc',
                'limit' => $limit,
            ])
            ->throw()
            ->json();

        return collect($rows)->map(fn (array $row) => $this->mapProduct($row))->all();
    }

    public function product(string $slug): ?array
    {
        $rows = $this->request()
            ->get('/rest/v1/products', [
                'select' => '*',
                'slug' => "eq.{$slug}",
                'limit' => 1,
            ])
            ->throw()
            ->json();

        $row = $rows[0] ?? null;

        return is_array($row) ? $this->mapProductDetail($row) : null;
    }

    public function related(string $slug, int $limit = 4): array
    {
        $product = $this->product($slug);

        if (! $product) {
            return [];
        }

        $sameCategory = $this->request()
            ->get('/rest/v1/products', [
                'select' => '*',
                'category_slug' => "eq.{$product['categorySlug']}",
                'slug' => "neq.{$slug}",
                'limit' => $limit,
            ])
            ->throw()
            ->json();

        $related = collect($sameCategory)->map(fn (array $row) => $this->mapProductDetail($row));

        if ($related->count() >= $limit) {
            return $related->take($limit)->values()->all();
        }

        $fallback = $this->request()
            ->get('/rest/v1/products', [
                'select' => '*',
                'category_slug' => "neq.{$product['categorySlug']}",
                'slug' => "neq.{$slug}",
                'limit' => $limit - $related->count(),
            ])
            ->throw()
            ->json();

        return $related
            ->concat(collect($fallback)->map(fn (array $row) => $this->mapProductDetail($row)))
            ->take($limit)
            ->values()
            ->all();
    }

    public function categories(): array
    {
        return $this->request()
            ->get('/rest/v1/categories', [
                'select' => '*',
                'order' => 'name.asc',
            ])
            ->throw()
            ->json();
    }

    public function createProduct(array $data): array
    {
        $rows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/products', $this->productPayload($data))
            ->throw()
            ->json();

        $row = $rows[0] ?? $rows;

        return $this->mapProductDetail($row);
    }

    public function updateProduct(string $id, array $data): array
    {
        $rows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->withQueryParameters(['id' => 'eq.'.$id])
            ->patch('/rest/v1/products', $this->productPayload($data))
            ->throw()
            ->json();

        $row = $rows[0] ?? null;

        abort_if(! is_array($row), 404, 'Product not found.');

        return $this->mapProductDetail($row);
    }

    public function deleteAllProducts(): void
    {
        $this->request()
            ->withQueryParameters(['id' => 'not.is.null'])
            ->delete('/rest/v1/products')
            ->throw();
    }

    private function productPayload(array $data): array
    {
        $name = trim((string) $data['name']);
        $slug = trim((string) ($data['slug'] ?? ''));
        $tags = array_values(array_filter(array_map(
            fn ($tag) => preg_replace('/[^A-Za-z0-9_]/', '', trim((string) $tag)),
            $data['tags'] ?? [],
        )));
        $galleryUrls = array_values(array_filter(array_map('trim', $data['gallery'] ?? [])));
        $specs = collect($data['specs'] ?? [])
            ->map(fn ($spec) => [
                'label' => trim((string) ($spec['label'] ?? '')),
                'value' => trim((string) ($spec['value'] ?? '')),
            ])
            ->filter(fn ($spec) => $spec['label'] !== '' && $spec['value'] !== '')
            ->values()
            ->all();

        return [
            'name' => $name,
            'slug' => $slug !== '' ? Str::slug($slug) : Str::slug($name),
            'category_slug' => $data['categorySlug'],
            'collection' => $data['collection'],
            'brand' => $data['brand'],
            'price' => (int) $data['price'],
            'compare_at_price' => isset($data['compareAtPrice']) ? (int) $data['compareAtPrice'] : null,
            'rating' => (float) ($data['rating'] ?? 0),
            'review_count' => (int) ($data['reviewCount'] ?? 0),
            'image_url' => $data['image'],
            'badge' => $data['badge'] ?? null,
            'featured' => (bool) ($data['featured'] ?? false),
            'stock' => (int) ($data['stock'] ?? 0),
            'on_sale' => (bool) ($data['onSale'] ?? false),
            'unit' => $data['unit'] ?? null,
            'arrival' => (bool) ($data['arrival'] ?? false),
            'tags' => $tags,
            'description' => $data['description'] ?? null,
            'gallery_urls' => $galleryUrls,
            'specs' => $specs,
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

    private function normalizeImage(?string $image): string
    {
        $image = trim((string) $image);

        if ($image === '' || str_contains($image, 'picsum.photos') || str_contains($image, 'fastly.picsum.photos')) {
            return '/images/products/product-placeholder.svg';
        }

        return $image;
    }

    private function normalizeGallery(array $gallery, string $mainImage): array
    {
        return collect($gallery)
            ->map(fn ($image) => $this->normalizeImage(is_string($image) ? $image : null))
            ->filter(fn ($image) => $image !== '' && $image !== '/images/products/product-placeholder.svg')
            ->prepend($mainImage)
            ->unique()
            ->values()
            ->all();
    }

    private function mapProduct(array $row): array
    {
        $categorySlug = (string) ($row['category_slug'] ?? 'others');

        return [
            'id' => (string) $row['id'],
            'slug' => (string) $row['slug'],
            'name' => (string) $row['name'],
            'category' => Str::headline($categorySlug),
            'categorySlug' => $categorySlug,
            'collection' => (string) $row['collection'],
            'brand' => (string) $row['brand'],
            'price' => (int) $row['price'],
            'compareAtPrice' => $row['compare_at_price'] !== null ? (int) $row['compare_at_price'] : null,
            'rating' => (float) $row['rating'],
            'reviewCount' => (int) $row['review_count'],
            'image' => $this->normalizeImage($row['image_url'] ?? null),
            'badge' => $row['badge'],
            'featured' => (bool) $row['featured'],
            'stock' => (int) $row['stock'],
            'onSale' => (bool) $row['on_sale'],
            'unit' => $row['unit'],
            'arrival' => (bool) $row['arrival'],
            'tags' => $row['tags'] ?? [],
        ];
    }

    private function mapProductDetail(array $row): array
    {
        $product = $this->mapProduct($row);
        $content = ProductContent::forCategory($product['categorySlug']);
        $gallery = $row['gallery_urls'] ?? [];
        $specs = $row['specs'] ?? [];

        if (! is_array($gallery) || count(array_filter($gallery)) === 0) {
            $gallery = ProductContent::galleryFor($product['slug'], $product['image']);
        } else {
            $gallery = $this->normalizeGallery($gallery, $product['image']);
        }

        if (! is_array($specs) || count($specs) === 0) {
            $specs = $content['specs'];
        }

        return [
            ...$product,
            'compareAtPrice' => $product['compareAtPrice'] ?? null,
            'badge' => $product['badge'] ?? null,
            'unit' => $product['unit'] ?? null,
            'gallery' => array_values($gallery),
            'description' => $row['description'] ?? $content['description'],
            'specs' => array_values($specs),
        ];
    }
}
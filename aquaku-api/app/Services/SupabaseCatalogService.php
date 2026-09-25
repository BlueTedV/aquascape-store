<?php

namespace App\Services;

use App\Support\ProductContent;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Catalog service for querying and maintaining store products.
 *
 * Interfaces with Supabase PostgREST endpoints, handles CRUD operations for the
 * administrative product manager, and normalizes product objects with placeholder fallbacks.
 */
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

    public function products(array $filters = []): array
    {
        $params = [
            'select' => '*',
        ];

        // 1. Category Filter
        if (! empty($filters['category']) && $filters['category'] !== 'all') {
            $params['category_slug'] = 'eq.' . trim((string) $filters['category']);
        }

        // 2. Collection Filter
        if (! empty($filters['collection']) && $filters['collection'] !== 'all') {
            $params['collection'] = 'eq.' . trim((string) $filters['collection']);
        }

        // 3. Brand Filter
        if (! empty($filters['brands'])) {
            $brandsList = is_array($filters['brands']) ? $filters['brands'] : explode(',', (string) $filters['brands']);
            $brandsList = array_values(array_filter(array_map('trim', $brandsList)));
            if (count($brandsList) === 1) {
                $params['brand'] = 'eq.' . $brandsList[0];
            } elseif (count($brandsList) > 1) {
                $params['brand'] = 'in.(' . implode(',', array_map(fn ($b) => '"' . str_replace('"', '', $b) . '"', $brandsList)) . ')';
            }
        } elseif (! empty($filters['brand'])) {
            $params['brand'] = 'eq.' . trim((string) $filters['brand']);
        }

        // 4. Status Filter
        if (! empty($filters['statuses'])) {
            $statusList = is_array($filters['statuses']) ? $filters['statuses'] : explode(',', (string) $filters['statuses']);
            if (in_array('available', $statusList, true)) {
                $params['stock'] = 'gt.0';
            }
            if (in_array('sale', $statusList, true)) {
                $params['on_sale'] = 'eq.true';
            }
            if (in_array('new', $statusList, true)) {
                $params['arrival'] = 'eq.true';
            }
        }

        // 5. Price Filters
        if (isset($filters['maxPrice']) && is_numeric($filters['maxPrice'])) {
            $params['price'] = 'lte.' . (int) $filters['maxPrice'];
        }
        if (isset($filters['minPrice']) && is_numeric($filters['minPrice'])) {
            $params['price'] = 'gte.' . (int) $filters['minPrice'];
        }

        // 6. Search Query
        if (! empty($filters['q'])) {
            $q = trim((string) $filters['q']);
            $cleanQ = str_replace(['(', ')', '"', ','], '', $q);
            if ($cleanQ !== '') {
                $params['or'] = "(name.ilike.*{$cleanQ}*,brand.ilike.*{$cleanQ}*,collection.ilike.*{$cleanQ}*)";
            }
        }

        // 7. Sort Options
        $sort = (string) ($filters['sort'] ?? 'popular');
        $params['order'] = match ($sort) {
            'newest' => 'arrival.desc,created_at.desc',
            'price-asc' => 'price.asc',
            'price-desc' => 'price.desc',
            'rating' => 'rating.desc,review_count.desc',
            default => 'featured.desc,review_count.desc',
        };

        // 8. Pagination
        $limit = max(1, min(100, (int) ($filters['limit'] ?? 12)));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $offset = ($page - 1) * $limit;

        $params['limit'] = $limit;
        $params['offset'] = $offset;

        $response = $this->request()
            ->withHeaders(['Prefer' => 'count=exact'])
            ->get('/rest/v1/products', $params);

        $rows = $response->json();
        if (! is_array($rows)) {
            $rows = [];
        }

        $contentRange = $response->header('Content-Range') ?? '';
        $total = count($rows);
        if (preg_match('/\/(\d+)$/', $contentRange, $matches)) {
            $total = (int) $matches[1];
        }

        $totalPages = max(1, (int) ceil($total / $limit));
        $mappedProducts = collect($rows)->map(fn (array $row) => $this->mapProduct($row))->all();

        // Fetch catalog metadata (all brands and max price)
        $metaRows = $this->request()
            ->get('/rest/v1/products', [
                'select' => 'brand,price',
            ])
            ->json();

        $brands = collect($metaRows)->pluck('brand')->filter()->unique()->sort()->values()->all();
        $maxCatalogPrice = (int) (collect($metaRows)->max('price') ?: 1000000);

        return [
            'products' => $mappedProducts,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => $totalPages,
            'brands' => $brands,
            'maxPrice' => $maxCatalogPrice,
        ];
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
            ->post('/rest/v1/products', $this->productPayload($data, false))
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
            ->patch('/rest/v1/products', $this->productPayload($data, true))
            ->throw()
            ->json();

        $row = $rows[0] ?? null;

        abort_if(! is_array($row), 404, 'Product not found.');

        return $this->mapProductDetail($row);
    }

    public function deleteProduct(string $id): bool
    {
        $this->request()
            ->withQueryParameters(['id' => 'eq.'.$id])
            ->delete('/rest/v1/products')
            ->throw();

        return true;
    }

    public function deleteAllProducts(): void
    {
        $this->request()
            ->withQueryParameters(['id' => 'not.is.null'])
            ->delete('/rest/v1/products')
            ->throw();
    }

    private function productPayload(array $data, bool $isUpdate = false): array
    {
        $name = trim((string) $data['name']);
        $slug = trim((string) ($data['slug'] ?? ''));
        $tags = isset($data['tags']) && is_array($data['tags']) ? array_values(array_filter($data['tags'])) : [];
        $gallery = isset($data['gallery']) && is_array($data['gallery']) ? array_values(array_filter($data['gallery'])) : [];
        $galleryUrls = $this->normalizeGallery($gallery, $data['image']);
        $specs = isset($data['specs']) && is_array($data['specs']) ? array_values($data['specs']) : [];

        $payload = [
            'name' => $name,
            'slug' => $slug !== '' ? Str::slug($slug) : Str::slug($name),
            'category_slug' => $data['categorySlug'],
            'collection' => $data['collection'],
            'brand' => $data['brand'],
            'price' => (int) $data['price'],
            'compare_at_price' => isset($data['compareAtPrice']) ? (int) $data['compareAtPrice'] : null,
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

        if (! $isUpdate) {
            $payload['rating'] = (float) ($data['rating'] ?? 0);
            $payload['review_count'] = (int) ($data['reviewCount'] ?? 0);
        } elseif (isset($data['rating']) && isset($data['reviewCount'])) {
            $payload['rating'] = (float) $data['rating'];
            $payload['review_count'] = (int) $data['reviewCount'];
        }

        return $payload;
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

    // Deduplicate and sanitize gallery image URLs, ensuring the primary image is always present first
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

    /**
     * Map a raw Supabase product record into a rich product detail payload.
     *
     * Injects category-specific default descriptions, specifications, and gallery images
     * from `ProductContent` whenever custom values are not populated in the database.
     */
    private function mapProductDetail(array $row): array
    {
        $product = $this->mapProduct($row);
        $content = ProductContent::forCategory($product['categorySlug']);
        $gallery = $row['gallery_urls'] ?? [];
        $specs = $row['specs'] ?? [];

        // Fall back to category gallery images if the database does not contain custom images
        if (! is_array($gallery) || count(array_filter($gallery)) === 0) {
            $gallery = ProductContent::galleryFor($product['slug'], $product['image']);
        } else {
            $gallery = $this->normalizeGallery($gallery, $product['image']);
        }

        // Supply standard category specifications (materials, lighting, CO2) if unpopulated
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
<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SupabaseReviewService
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

    public function getReviewsForProduct(string $productSlug): array
    {
        $rows = $this->request()
            ->get('/rest/v1/reviews', [
                'select' => '*',
                'product_slug' => "eq.{$productSlug}",
                'order' => 'created_at.desc',
            ])
            ->throw()
            ->json();

        return collect($rows)->map(fn (array $row) => [
            'id' => (string) $row['id'],
            'productSlug' => (string) $row['product_slug'],
            'userName' => (string) $row['user_name'],
            'rating' => (int) $row['rating'],
            'comment' => (string) $row['comment'],
            'createdAt' => (string) $row['created_at'],
        ])->all();
    }

    public function createReview(string $productSlug, array $payload, ?string $userId = null): array
    {
        // 1. Fetch product to get product_id
        $products = $this->request()
            ->get('/rest/v1/products', [
                'select' => 'id,rating,review_count',
                'slug' => "eq.{$productSlug}",
                'limit' => 1,
            ])
            ->throw()
            ->json();

        $product = $products[0] ?? null;
        abort_if(! is_array($product), 404, 'Product not found.');

        $productId = $product['id'];
        $rating = max(1, min(5, (int) ($payload['rating'] ?? 5)));
        $userName = trim((string) ($payload['userName'] ?? 'Anonymous'));
        $comment = trim((string) ($payload['comment'] ?? ''));

        // 2. Insert new review
        $reviewPayload = [
            'product_id' => $productId,
            'product_slug' => $productSlug,
            'user_id' => $userId,
            'user_name' => $userName,
            'rating' => $rating,
            'comment' => $comment,
        ];

        $insertedRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/reviews', $reviewPayload)
            ->throw()
            ->json();

        $review = $insertedRows[0] ?? $insertedRows;

        // 3. Recalculate average rating & review count for product
        $allReviews = $this->request()
            ->get('/rest/v1/reviews', [
                'select' => 'rating',
                'product_slug' => "eq.{$productSlug}",
            ])
            ->throw()
            ->json();

        $reviewCount = count($allReviews);
        $totalStars = array_sum(array_column($allReviews, 'rating'));
        $newAverageRating = $reviewCount > 0 ? round($totalStars / $reviewCount, 1) : 0;

        // Update product in Supabase
        $this->request()
            ->withQueryParameters(['id' => 'eq.' . $productId])
            ->patch('/rest/v1/products', [
                'rating' => $newAverageRating,
                'review_count' => $reviewCount,
            ])
            ->throw();

        return [
            'id' => (string) $review['id'],
            'productSlug' => (string) $review['product_slug'],
            'userName' => (string) $review['user_name'],
            'rating' => (int) $review['rating'],
            'comment' => (string) $review['comment'],
            'createdAt' => (string) $review['created_at'],
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

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

    public function getPosts(string $sort = 'top', int $limit = 12, ?string $userId = null): array
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

        $userLikedIds = [];
        if ($userId !== null && ! empty($rows)) {
            try {
                $postIds = collect($rows)->pluck('id')->all();
                $likeRows = $this->request()
                    ->get('/rest/v1/gallery_post_likes', [
                        'select' => 'post_id',
                        'user_id' => "eq.{$userId}",
                        'post_id' => 'in.(' . implode(',', $postIds) . ')',
                    ])
                    ->json();

                if (is_array($likeRows)) {
                    $userLikedIds = collect($likeRows)->pluck('post_id')->all();
                }
            } catch (\Throwable) {
                // Table might not exist yet
            }
        }

        return collect($rows)->map(function (array $row) use ($userLikedIds) {
            $mapped = $this->mapPost($row);
            $mapped['isLiked'] = in_array($mapped['id'], $userLikedIds, true);
            return $mapped;
        })->all();
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
            'comments_count' => 0,
        ];

        $insertedRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/gallery_posts', $insertData)
            ->throw()
            ->json();

        $row = $insertedRows[0] ?? $insertedRows;

        return $this->mapPost($row);
    }

    public function toggleLikePost(string $id, string $userId): array
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

        $currentCount = max(0, (int) ($post['likes_count'] ?? 0));
        $isLiked = false;

        // 2. Check if user already liked the post via gallery_post_likes
        $likeRecord = null;
        try {
            $likeRows = $this->request()
                ->get('/rest/v1/gallery_post_likes', [
                    'select' => 'id',
                    'post_id' => "eq.{$id}",
                    'user_id' => "eq.{$userId}",
                    'limit' => 1,
                ])
                ->json();

            if (is_array($likeRows) && ! empty($likeRows)) {
                $likeRecord = $likeRows[0];
            }
        } catch (\Throwable) {
            // Table may not exist yet
        }

        if ($likeRecord !== null) {
            // User already liked -> UNLIKE (decrement)
            try {
                $this->request()
                    ->delete('/rest/v1/gallery_post_likes', [
                        'post_id' => "eq.{$id}",
                        'user_id' => "eq.{$userId}",
                    ]);
            } catch (\Throwable) {
                // Ignore
            }

            $newCount = max(0, $currentCount - 1);
            $isLiked = false;
        } else {
            // User has not liked -> LIKE (increment)
            try {
                $this->request()
                    ->post('/rest/v1/gallery_post_likes', [
                        'post_id' => $id,
                        'user_id' => $userId,
                    ]);
            } catch (\Throwable) {
                // Ignore
            }

            $newCount = $currentCount + 1;
            $isLiked = true;
        }

        // 3. Update likes_count in gallery_posts
        try {
            $updatedRows = $this->request()
                ->withHeaders(['Prefer' => 'return=representation'])
                ->withQueryParameters(['id' => 'eq.' . $id])
                ->patch('/rest/v1/gallery_posts', [
                    'likes_count' => $newCount,
                    'updated_at' => now()->toIso8601String(),
                ])
                ->throw()
                ->json();

            $updated = $updatedRows[0] ?? $post;
        } catch (\Throwable) {
            $updated = $post;
        }

        $updated['likes_count'] = $newCount;

        $mapped = $this->mapPost($updated);
        $mapped['isLiked'] = $isLiked;

        return $mapped;
    }

    public function likePost(string $id, ?string $userId = null): array
    {
        if ($userId !== null) {
            return $this->toggleLikePost($id, $userId);
        }

        // Fallback if no userId provided
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

        $newCount = max(0, ((int) ($post['likes_count'] ?? 0)) + 1);

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

    public function getComments(string $postId, ?string $userId = null): array
    {
        try {
            $rows = $this->request()
                ->get('/rest/v1/gallery_post_comments', [
                    'select' => '*',
                    'post_id' => "eq.{$postId}",
                    'order' => 'created_at.asc',
                ])
                ->throw()
                ->json();

            if (! is_array($rows)) {
                return [];
            }

            return collect($rows)->map(fn (array $row) => $this->mapComment($row, $userId))->all();
        } catch (\Throwable) {
            return [];
        }
    }

    public function createComment(string $postId, array $payload, ?string $userId = null, ?string $userName = null): array
    {
        // 1. Verify post exists
        $rows = $this->request()
            ->get('/rest/v1/gallery_posts', [
                'select' => 'id,comments_count',
                'id' => "eq.{$postId}",
                'limit' => 1,
            ])
            ->throw()
            ->json();

        $post = $rows[0] ?? null;
        abort_if(! is_array($post), 404, 'Gallery post not found.');

        $authorName = trim((string) ($userName ?? $payload['authorName'] ?? 'Aquascaper'));
        $content = trim((string) ($payload['content'] ?? ''));
        abort_if($content === '', 422, 'Comment content cannot be empty.');

        $commentData = [
            'post_id' => $postId,
            'user_id' => $userId,
            'author_name' => $authorName !== '' ? $authorName : 'Aquascaper',
            'content' => $content,
        ];

        $insertedRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/gallery_post_comments', $commentData)
            ->throw()
            ->json();

        $comment = $insertedRows[0] ?? $insertedRows;

        // 2. Increment comments_count on gallery_posts
        try {
            $currentComments = max(0, (int) ($post['comments_count'] ?? 0));
            $this->request()
                ->withQueryParameters(['id' => 'eq.' . $postId])
                ->patch('/rest/v1/gallery_posts', [
                    'comments_count' => $currentComments + 1,
                    'updated_at' => now()->toIso8601String(),
                ]);
        } catch (\Throwable) {
            // Ignore failure if column missing
        }

        return $this->mapComment($comment, $userId);
    }

    public function deleteComment(string $commentId, ?string $userId = null, bool $isAdmin = false): bool
    {
        // Fetch comment to check ownership and post_id
        $rows = $this->request()
            ->get('/rest/v1/gallery_post_comments', [
                'select' => '*',
                'id' => "eq.{$commentId}",
                'limit' => 1,
            ])
            ->throw()
            ->json();

        $comment = $rows[0] ?? null;
        abort_if(! is_array($comment), 404, 'Comment not found.');

        if (! $isAdmin) {
            abort_if(! $userId || (string) ($comment['user_id'] ?? '') !== (string) $userId, 403, 'Unauthorized to delete this comment.');
        }

        $postId = (string) $comment['post_id'];

        // Delete comment
        $this->request()
            ->delete('/rest/v1/gallery_post_comments', [
                'id' => "eq.{$commentId}",
            ])
            ->throw();

        // Decrement comments_count on post
        try {
            $postRows = $this->request()
                ->get('/rest/v1/gallery_posts', [
                    'select' => 'comments_count',
                    'id' => "eq.{$postId}",
                    'limit' => 1,
                ])
                ->json();

            if (is_array($postRows) && ! empty($postRows)) {
                $currentComments = max(0, (int) ($postRows[0]['comments_count'] ?? 0));
                $newComments = max(0, $currentComments - 1);
                $this->request()
                    ->withQueryParameters(['id' => 'eq.' . $postId])
                    ->patch('/rest/v1/gallery_posts', [
                        'comments_count' => $newComments,
                    ]);
            }
        } catch (\Throwable) {
            // Ignore
        }

        return true;
    }

    public function getAdminPosts(): array
    {
        $rows = $this->request()
            ->get('/rest/v1/gallery_posts', [
                'select' => '*',
                'order' => 'created_at.desc',
                'limit' => 100,
            ])
            ->throw()
            ->json();

        if (! is_array($rows)) {
            return [];
        }

        return collect($rows)->map(fn (array $row) => $this->mapPost($row))->all();
    }

    public function deletePost(string $id): bool
    {
        $this->request()
            ->delete('/rest/v1/gallery_posts', [
                'id' => "eq.{$id}",
            ])
            ->throw();

        return true;
    }

    private function mapComment(array $row, ?string $currentUserId = null): array
    {
        $userId = isset($row['user_id']) && $row['user_id'] !== null ? (string) $row['user_id'] : null;

        return [
            'id' => (string) $row['id'],
            'postId' => (string) $row['post_id'],
            'userId' => $userId,
            'authorName' => (string) ($row['author_name'] ?? 'Aquascaper'),
            'content' => (string) ($row['content'] ?? ''),
            'createdAt' => (string) ($row['created_at'] ?? now()->toIso8601String()),
            'isOwner' => $currentUserId !== null && $userId !== null && $userId === (string) $currentUserId,
        ];
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
            'likesCount' => max(0, (int) ($row['likes_count'] ?? 0)),
            'commentsCount' => max(0, (int) ($row['comments_count'] ?? 0)),
            'isLiked' => (bool) ($row['isLiked'] ?? $row['is_liked'] ?? false),
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

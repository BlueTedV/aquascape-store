<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class SupabaseStorageService
{
    private string $url;

    private string $serviceRoleKey;

    private string $bucket;

    public function __construct()
    {
        $this->url = rtrim((string) config('services.supabase.url'), '/');
        $this->serviceRoleKey = (string) config('services.supabase.service_role_key');
        $this->bucket = (string) config('services.supabase.storage_bucket', 'product-images');

        if ($this->url === '' || $this->serviceRoleKey === '') {
            throw new RuntimeException('Supabase storage configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Laravel .env.');
        }
    }

    public function uploadProductImage(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $path = sprintf('products/%s/%s.%s', now()->format('Y/m'), (string) Str::uuid(), $extension);
        $contents = file_get_contents($file->getRealPath());

        if ($contents === false) {
            throw new RuntimeException('Could not read uploaded image.');
        }

        Http::baseUrl($this->url)
            ->acceptJson()
            ->withHeaders([
                'apikey' => $this->serviceRoleKey,
                'Authorization' => "Bearer {$this->serviceRoleKey}",
                'Content-Type' => $file->getMimeType() ?: 'application/octet-stream',
                'x-upsert' => 'false',
            ])
            ->withBody($contents, $file->getMimeType() ?: 'application/octet-stream')
            ->post("/storage/v1/object/{$this->bucket}/{$path}")
            ->throw();

        return [
            'bucket' => $this->bucket,
            'path' => $path,
            'url' => "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}",
        ];
    }

    public function uploadBase64Image(string $base64Data, string $folder = 'gallery'): string
    {
        if (! preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
            return $base64Data;
        }

        try {
            $extension = strtolower($type[1]) === 'jpeg' ? 'jpg' : strtolower($type[1]);
            $data = substr($base64Data, strpos($base64Data, ',') + 1);
            $decoded = base64_decode($data);

            if ($decoded === false) {
                return $base64Data;
            }

            $path = sprintf('%s/%s/%s.%s', $folder, now()->format('Y/m'), (string) Str::uuid(), $extension);
            $mimeType = "image/{$type[1]}";

            Http::baseUrl($this->url)
                ->acceptJson()
                ->withHeaders([
                    'apikey' => $this->serviceRoleKey,
                    'Authorization' => "Bearer {$this->serviceRoleKey}",
                    'Content-Type' => $mimeType,
                    'x-upsert' => 'false',
                ])
                ->withBody($decoded, $mimeType)
                ->post("/storage/v1/object/{$this->bucket}/{$path}")
                ->throw();

            return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}";
        } catch (\Throwable) {
            return $base64Data;
        }
    }
}
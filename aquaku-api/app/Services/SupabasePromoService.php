<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SupabasePromoService
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

    public function getPromos(bool $activeOnly = false): array
    {
        $query = ['select' => '*', 'order' => 'created_at.desc'];
        if ($activeOnly) {
            $query['is_active'] = 'eq.true';
        }

        $rows = $this->request()
            ->get('/rest/v1/promos', $query)
            ->throw()
            ->json();

        return collect($rows)->map(fn (array $row) => $this->mapPromo($row))->all();
    }

    public function getPromoByCode(string $code): ?array
    {
        $normalizedCode = strtoupper(trim($code));

        $rows = $this->request()
            ->get('/rest/v1/promos', [
                'select' => '*',
                'code' => "eq.{$normalizedCode}",
                'is_active' => 'eq.true',
                'limit' => 1,
            ])
            ->throw()
            ->json();

        $row = $rows[0] ?? null;

        return is_array($row) ? $this->mapPromo($row) : null;
    }

    public function createPromo(array $payload): array
    {
        $code = strtoupper(trim((string) ($payload['code'] ?? '')));
        $name = trim((string) ($payload['name'] ?? $code));
        $type = in_array($payload['type'] ?? '', ['percentage', 'fixed', 'shipping'], true) ? $payload['type'] : 'percentage';
        $value = max(1, (int) ($payload['value'] ?? 10));
        $maxDiscount = max(0, (int) ($payload['maxDiscount'] ?? 0));
        $minSubtotal = max(0, (int) ($payload['minSubtotal'] ?? 0));
        $description = trim((string) ($payload['description'] ?? ''));

        $insertData = [
            'code' => $code,
            'name' => $name,
            'type' => $type,
            'value' => $value,
            'max_discount' => $maxDiscount,
            'min_subtotal' => $minSubtotal,
            'description' => $description !== '' ? $description : "{$code} Promo Voucher",
            'is_active' => true,
        ];

        $insertedRows = $this->request()
            ->withHeaders(['Prefer' => 'return=representation'])
            ->post('/rest/v1/promos', $insertData)
            ->throw()
            ->json();

        $row = $insertedRows[0] ?? $insertedRows;

        return $this->mapPromo($row);
    }

    public function deletePromo(string $id): bool
    {
        $this->request()
            ->withQueryParameters(['id' => "eq.{$id}"])
            ->delete('/rest/v1/promos')
            ->throw();

        return true;
    }

    private function mapPromo(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'code' => (string) ($row['code'] ?? ''),
            'name' => (string) ($row['name'] ?? ''),
            'type' => (string) ($row['type'] ?? 'percentage'),
            'value' => (int) ($row['value'] ?? 0),
            'maxDiscount' => (int) ($row['max_discount'] ?? 0),
            'minSubtotal' => (int) ($row['min_subtotal'] ?? 0),
            'description' => (string) ($row['description'] ?? ''),
            'isActive' => (bool) ($row['is_active'] ?? true),
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

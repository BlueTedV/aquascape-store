<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SupabaseAuthService
{
    private string $url;

    private string $publishableKey;

    private string $serviceRoleKey;

    public function __construct()
    {
        $this->url = rtrim((string) config('services.supabase.url'), '/');
        $this->publishableKey = (string) config('services.supabase.publishable_key');
        $this->serviceRoleKey = (string) config('services.supabase.service_role_key');

        if ($this->url === '' || $this->publishableKey === '') {
            throw new RuntimeException('Supabase auth configuration is missing. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Laravel .env.');
        }
    }

    public function signIn(string $email, string $password): array
    {
        $payload = $this->authRequest()
            ->post('/auth/v1/token?grant_type=password', [
                'email' => $email,
                'password' => $password,
            ])
            ->throw()
            ->json();

        return $this->sessionPayload($payload);
    }

    public function signUp(string $email, string $password, ?string $fullName = null, ?string $phone = null): array
    {
        $payload = $this->authRequest()
            ->post('/auth/v1/signup', [
                'email' => $email,
                'password' => $password,
                'data' => array_filter([
                    'full_name' => $fullName,
                    'phone' => $phone,
                ], fn ($value) => $value !== null && $value !== ''),
            ])
            ->throw()
            ->json();

        $user = $payload['user'] ?? $payload;
        if (isset($user['id'])) {
            $this->upsertProfile((string) $user['id'], $fullName, $phone);
        }

        return $this->sessionPayload($payload);
    }

    public function signOut(string $accessToken): void
    {
        $this->authRequest($accessToken)
            ->post('/auth/v1/logout')
            ->throw();
    }

    public function accountFromRequest(Request $request): array
    {
        $accessToken = $this->bearerToken($request);
        $user = $this->userFromToken($accessToken);
        $profile = $this->profile((string) $user['id']);
        $shippingAddress = $this->defaultShippingAddress((string) $user['id']);

        return [
            'accessToken' => $accessToken,
            'user' => $this->mapUser($user, $profile),
            'profile' => $profile,
            'shippingAddress' => $shippingAddress,
            'isAdmin' => $this->isAdmin($user, $profile),
        ];
    }

    public function requireAdmin(Request $request): array
    {
        $account = $this->accountFromRequest($request);

        abort_unless($account['isAdmin'], 403, 'Admin access required.');

        return $account;
    }

    public function updateProfile(Request $request, array $data): array
    {
        $account = $this->accountFromRequest($request);
        $userId = (string) $account['user']['id'];

        $this->upsertProfile(
            $userId,
            $data['fullName'] ?? null,
            $data['phone'] ?? null,
        );

        return $this->accountFromRequest($request);
    }

    public function updateShippingAddress(Request $request, array $data): array
    {
        $account = $this->accountFromRequest($request);
        $userId = (string) $account['user']['id'];

        $payload = [
            'user_id' => $userId,
            'recipient_name' => $data['recipientName'],
            'phone' => $data['phone'],
            'address_line1' => $data['addressLine1'],
            'address_line2' => $data['addressLine2'] ?? null,
            'city' => $data['city'],
            'province' => $data['province'],
            'postal_code' => $data['postalCode'],
            'country' => $data['country'] ?? 'Indonesia',
            'is_default' => true,
            'updated_at' => now()->toISOString(),
        ];

        $existing = $this->defaultShippingAddress($userId);

        if ($existing && isset($existing['id'])) {
            $this->serviceRequest()
                ->withQueryParameters(['id' => 'eq.'.$existing['id']])
                ->patch('/rest/v1/shipping_addresses', $payload)
                ->throw();
        } else {
            $payload['created_at'] = now()->toISOString();

            $this->serviceRequest()
                ->post('/rest/v1/shipping_addresses', $payload)
                ->throw();
        }

        return $this->accountFromRequest($request);
    }

    public function bearerToken(Request $request): string
    {
        $token = $request->bearerToken();

        abort_if(! $token, 401, 'Authentication required.');

        return $token;
    }

    public function userFromToken(string $accessToken): array
    {
        return $this->authRequest($accessToken)
            ->get('/auth/v1/user')
            ->throw()
            ->json();
    }

    public function isAdmin(array $user, ?array $profile = null): bool
    {
        $email = strtolower((string) ($user['email'] ?? ''));
        $adminEmails = collect(config('services.supabase.admin_emails', []))
            ->map(fn (string $value) => strtolower(trim($value)))
            ->filter()
            ->all();

        $appRole = $user['app_metadata']['role'] ?? null;
        $userRole = $user['user_metadata']['role'] ?? null;
        $profileRole = $profile['role'] ?? null;

        return in_array($email, $adminEmails, true)
            || $appRole === 'admin'
            || $userRole === 'admin'
            || $profileRole === 'admin';
    }

    private function upsertProfile(string $userId, ?string $fullName, ?string $phone): void
    {
        $this->serviceRequest()
            ->withHeaders(['Prefer' => 'resolution=merge-duplicates'])
            ->post('/rest/v1/profiles', [
                'id' => $userId,
                'full_name' => $fullName,
                'phone' => $phone,
                'updated_at' => now()->toISOString(),
            ])
            ->throw();
    }

    private function profile(string $userId): ?array
    {
        try {
            $rows = $this->serviceRequest()
                ->get('/rest/v1/profiles', [
                    'select' => 'id,full_name,phone,role',
                    'id' => 'eq.'.$userId,
                    'limit' => 1,
                ])
                ->throw()
                ->json();
        } catch (\Throwable) {
            try {
                $rows = $this->serviceRequest()
                    ->get('/rest/v1/profiles', [
                        'select' => 'id,full_name,phone',
                        'id' => 'eq.'.$userId,
                        'limit' => 1,
                    ])
                    ->throw()
                    ->json();
            } catch (\Throwable $error) {
                report($error);

                return null;
            }
        }

        $profile = $rows[0] ?? null;

        return is_array($profile) ? $this->mapProfile($profile) : null;
    }

    private function defaultShippingAddress(string $userId): ?array
    {
        $rows = $this->serviceRequest()
            ->get('/rest/v1/shipping_addresses', [
                'select' => 'id,recipient_name,phone,address_line1,address_line2,city,province,postal_code,country,is_default',
                'user_id' => 'eq.'.$userId,
                'is_default' => 'eq.true',
                'limit' => 1,
            ])
            ->throw()
            ->json();

        $address = $rows[0] ?? null;

        return is_array($address) ? $this->mapAddress($address) : null;
    }

    private function sessionPayload(array $payload): array
    {
        $user = $payload['user'] ?? (isset($payload['id']) ? $payload : null);
        $profile = is_array($user) && isset($user['id']) ? $this->profile((string) $user['id']) : null;

        return [
            'accessToken' => $payload['access_token'] ?? null,
            'refreshToken' => $payload['refresh_token'] ?? null,
            'expiresIn' => $payload['expires_in'] ?? null,
            'tokenType' => $payload['token_type'] ?? 'bearer',
            'user' => is_array($user) ? $this->mapUser($user, $profile) : null,
            'profile' => $profile,
            'isAdmin' => is_array($user) ? $this->isAdmin($user, $profile) : false,
        ];
    }

    private function mapUser(array $user, ?array $profile): array
    {
        return [
            'id' => (string) $user['id'],
            'email' => $user['email'] ?? null,
            'fullName' => $profile['fullName'] ?? $user['user_metadata']['full_name'] ?? null,
            'phone' => $profile['phone'] ?? $user['user_metadata']['phone'] ?? null,
            'role' => $profile['role'] ?? $user['app_metadata']['role'] ?? $user['user_metadata']['role'] ?? 'customer',
        ];
    }

    private function mapProfile(array $profile): array
    {
        return [
            'id' => (string) $profile['id'],
            'fullName' => $profile['full_name'] ?? null,
            'phone' => $profile['phone'] ?? null,
            'role' => $profile['role'] ?? 'customer',
        ];
    }

    private function mapAddress(array $address): array
    {
        return [
            'id' => (string) $address['id'],
            'recipientName' => $address['recipient_name'],
            'phone' => $address['phone'],
            'addressLine1' => $address['address_line1'],
            'addressLine2' => $address['address_line2'],
            'city' => $address['city'],
            'province' => $address['province'],
            'postalCode' => $address['postal_code'],
            'country' => $address['country'],
            'isDefault' => (bool) $address['is_default'],
        ];
    }

    private function authRequest(?string $accessToken = null): PendingRequest
    {
        return Http::baseUrl($this->url)
            ->acceptJson()
            ->withHeaders([
                'apikey' => $this->publishableKey,
                'Authorization' => 'Bearer '.($accessToken ?: $this->publishableKey),
            ]);
    }

    private function serviceRequest(): PendingRequest
    {
        if ($this->serviceRoleKey === '') {
            throw new RuntimeException('SUPABASE_SERVICE_ROLE_KEY is required for profile, shipping, and admin operations.');
        }

        return Http::baseUrl($this->url)
            ->acceptJson()
            ->withHeaders([
                'apikey' => $this->serviceRoleKey,
                'Authorization' => "Bearer {$this->serviceRoleKey}",
            ]);
    }
}
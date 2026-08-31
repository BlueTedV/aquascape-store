<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('midtrans:check', function (\App\Services\MidtransService $midtrans) {
    $this->info('=== Midtrans Configuration & Connectivity Check ===');

    $serverKey = (string) config('services.midtrans.server_key');
    $clientKey = (string) config('services.midtrans.client_key');
    $isProd = (bool) config('services.midtrans.is_production');

    $this->line('Environment : ' . ($isProd ? '<fg=red>PRODUCTION</>' : '<fg=green>SANDBOX</>'));
    $this->line('Server Key  : ' . ($serverKey ? substr($serverKey, 0, 10) . '...' . substr($serverKey, -4) : '<fg=red>NOT SET</>'));
    $this->line('Client Key  : ' . ($clientKey ? substr($clientKey, 0, 10) . '...' . substr($clientKey, -4) : '<fg=red>NOT SET</>'));

    if (empty($serverKey) || empty($clientKey)) {
        $this->error('ERROR: MIDTRANS_SERVER_KEY or MIDTRANS_CLIENT_KEY is missing in your .env file.');
        return 1;
    }

    if (! $isProd && ! str_starts_with($serverKey, 'SB-')) {
        $this->warn('WARNING: Your environment is set to SANDBOX (MIDTRANS_IS_PRODUCTION=false), but your server key does NOT start with "SB-". If this is a production key, set MIDTRANS_IS_PRODUCTION=true or use a Sandbox server key.');
    }

    $this->info("\nTesting Snap Token generation with Midtrans API...");

    try {
        $testOrder = [
            'orderNumber' => 'AQ-DIAG-' . strtoupper(\Illuminate\Support\Str::random(6)),
            'totalAmount' => 10000,
            'customerName' => 'Midtrans Tester',
            'customerEmail' => 'tester@example.com',
            'customerPhone' => '081234567890',
            'shippingAddress' => 'Jl. Test No. 1',
            'shippingCity' => 'Jakarta',
            'shippingPostalCode' => '10110',
            'courier' => 'Standard Delivery',
            'shippingCost' => 0,
            'paymentMethod' => 'bank_transfer',
            'items' => [
                [
                    'productId' => 'TEST-001',
                    'productName' => 'Test Item',
                    'price' => 10000,
                    'quantity' => 1,
                ],
            ],
        ];

        $res = $midtrans->createSnapTransaction($testOrder);

        $this->info('[OK] Successfully generated Midtrans Snap Token!');
        $this->line('Order ID     : ' . $testOrder['orderNumber']);
        $this->line('Snap Token   : ' . $res['snapToken']);
        $this->line('Redirect URL : ' . $res['redirectUrl']);

        $this->info("\nTesting Webhook Signature Verification logic...");
        $mockStatusCode = '200';
        $mockGross = '10000.00';
        $mockSignature = hash('sha512', $testOrder['orderNumber'] . $mockStatusCode . $mockGross . $serverKey);
        $isValid = $midtrans->verifyNotificationSignature([
            'order_id' => $testOrder['orderNumber'],
            'status_code' => $mockStatusCode,
            'gross_amount' => $mockGross,
            'signature_key' => $mockSignature,
        ]);

        if ($isValid) {
            $this->info('[OK] Webhook SHA512 signature verification logic passed.');
        } else {
            $this->warn('[WARN] Webhook signature verification mismatch.');
        }

        $this->info("\nYour Midtrans integration backend connection is READY & WORKING properly!");
        return 0;
    } catch (\Throwable $e) {
        $this->error('[FAIL] Midtrans API Request Failed: ' . $e->getMessage());
        return 1;
    }
})->purpose('Test Midtrans API connectivity, Snap Token generation, and Webhook verification');



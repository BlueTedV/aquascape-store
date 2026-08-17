<?php

namespace App\Services;

use Throwable;

class VoucherService
{
    private array $defaultVouchers = [
        'AQUA10' => [
            'code' => 'AQUA10',
            'type' => 'percentage',
            'value' => 10,
            'maxDiscount' => 50000,
            'minSubtotal' => 50000,
            'description' => '10% OFF on your order (Max Rp 50.000, Min order Rp 50.000)',
        ],
        'FREESHIP' => [
            'code' => 'FREESHIP',
            'type' => 'shipping',
            'value' => 15000,
            'maxDiscount' => 15000,
            'minSubtotal' => 75000,
            'description' => 'Rp 15.000 Shipping Fee Discount (Min order Rp 75.000)',
        ],
        'NEWUSER' => [
            'code' => 'NEWUSER',
            'type' => 'fixed',
            'value' => 25000,
            'maxDiscount' => 25000,
            'minSubtotal' => 100000,
            'description' => 'Rp 25.000 Flat Discount for new aquascapers (Min order Rp 100.000)',
        ],
        'AQUASCAPE25' => [
            'code' => 'AQUASCAPE25',
            'type' => 'percentage',
            'value' => 25,
            'maxDiscount' => 100000,
            'minSubtotal' => 200000,
            'description' => '25% Mega Aquascape Discount (Max Rp 100.000, Min order Rp 200.000)',
        ],
    ];

    public function __construct(
        private readonly SupabasePromoService $promos,
    ) {}

    public function validate(string $code, int $subtotal, int $shippingCost = 0): array
    {
        $normalizedCode = strtoupper(trim($code));

        if ($normalizedCode === '') {
            abort(422, 'Voucher code is required.');
        }

        $voucher = null;

        try {
            $voucher = $this->promos->getPromoByCode($normalizedCode);
        } catch (Throwable) {
            // Fallback to defaults
        }

        if (! $voucher) {
            $voucher = $this->defaultVouchers[$normalizedCode] ?? null;
        }

        if (! $voucher) {
            abort(404, "Voucher code '{$normalizedCode}' is invalid or expired.");
        }

        $minSubtotal = (int) ($voucher['minSubtotal'] ?? $voucher['min_subtotal'] ?? 0);
        if ($subtotal < $minSubtotal) {
            $minFormatted = 'Rp ' . number_format($minSubtotal, 0, ',', '.');
            abort(422, "Voucher '{$normalizedCode}' requires a minimum subtotal of {$minFormatted}.");
        }

        $type = $voucher['type'] ?? 'percentage';
        $value = (int) ($voucher['value'] ?? 0);
        $maxDiscount = (int) ($voucher['maxDiscount'] ?? $voucher['max_discount'] ?? 0);

        $discount = 0;
        if ($type === 'percentage') {
            $calculated = (int) round(($subtotal * $value) / 100);
            $discount = $maxDiscount > 0 ? min($calculated, $maxDiscount) : $calculated;
        } elseif ($type === 'fixed') {
            $discount = min($value, $subtotal);
        } elseif ($type === 'shipping') {
            $discount = min($value, $shippingCost > 0 ? $shippingCost : $value);
        }

        return [
            'code' => $voucher['code'],
            'type' => $type,
            'discountAmount' => $discount,
            'description' => $voucher['description'],
        ];
    }
}

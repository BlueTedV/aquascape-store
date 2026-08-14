<?php

namespace App\Services;

class VoucherService
{
    /**
     * Curated active vouchers
     */
    private array $vouchers = [
        'AQUA10' => [
            'code' => 'AQUA10',
            'type' => 'percentage',
            'value' => 10, // 10% off
            'maxDiscount' => 50000, // Rp 50.000 max
            'minSubtotal' => 50000,
            'description' => '10% OFF on your order (Max Rp 50.000, Min order Rp 50.000)',
        ],
        'FREESHIP' => [
            'code' => 'FREESHIP',
            'type' => 'shipping',
            'value' => 15000, // Rp 15.000 shipping discount
            'maxDiscount' => 15000,
            'minSubtotal' => 75000,
            'description' => 'Rp 15.000 Shipping Fee Discount (Min order Rp 75.000)',
        ],
        'NEWUSER' => [
            'code' => 'NEWUSER',
            'type' => 'fixed',
            'value' => 25000, // Rp 25.000 off
            'maxDiscount' => 25000,
            'minSubtotal' => 100000,
            'description' => 'Rp 25.000 Flat Discount for new aquascapers (Min order Rp 100.000)',
        ],
        'AQUASCAPE25' => [
            'code' => 'AQUASCAPE25',
            'type' => 'percentage',
            'value' => 25, // 25% off
            'maxDiscount' => 100000, // Rp 100.000 max
            'minSubtotal' => 200000,
            'description' => '25% Mega Aquascape Discount (Max Rp 100.000, Min order Rp 200.000)',
        ],
    ];

    public function validate(string $code, int $subtotal, int $shippingCost = 0): array
    {
        $normalizedCode = strtoupper(trim($code));

        if ($normalizedCode === '') {
            abort(422, 'Voucher code is required.');
        }

        if (! isset($this->vouchers[$normalizedCode])) {
            abort(404, "Voucher code '{$normalizedCode}' is invalid or expired.");
        }

        $voucher = $this->vouchers[$normalizedCode];

        if ($subtotal < $voucher['minSubtotal']) {
            $minFormatted = 'Rp ' . number_format($voucher['minSubtotal'], 0, ',', '.');
            abort(422, "Voucher '{$normalizedCode}' requires a minimum subtotal of {$minFormatted}.");
        }

        $discount = 0;
        if ($voucher['type'] === 'percentage') {
            $calculated = (int) round(($subtotal * $voucher['value']) / 100);
            $discount = min($calculated, $voucher['maxDiscount']);
        } elseif ($voucher['type'] === 'fixed') {
            $discount = min($voucher['value'], $subtotal);
        } elseif ($voucher['type'] === 'shipping') {
            $discount = min($voucher['value'], $shippingCost > 0 ? $shippingCost : $voucher['value']);
        }

        return [
            'code' => $voucher['code'],
            'type' => $voucher['type'],
            'discountAmount' => $discount,
            'description' => $voucher['description'],
        ];
    }
}

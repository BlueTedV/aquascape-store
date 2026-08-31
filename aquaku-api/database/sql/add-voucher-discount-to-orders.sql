-- Migration: Add discount_amount and voucher_code columns to orders table
-- Run this once in the Supabase SQL Editor (or psql) to add the missing columns.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS voucher_code text;

-- Add a comment for clarity
COMMENT ON COLUMN public.orders.discount_amount IS 'Total discount applied via voucher code, in IDR (integer cents).';
COMMENT ON COLUMN public.orders.voucher_code IS 'The promo/voucher code that was applied to this order, if any.';

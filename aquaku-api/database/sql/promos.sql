-- Supabase SQL Schema for Promos / Vouchers
-- Run this script in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.promos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed', 'shipping')),
  value integer NOT NULL CHECK (value > 0),
  max_discount integer NOT NULL DEFAULT 0 CHECK (max_discount >= 0),
  min_subtotal integer NOT NULL DEFAULT 0 CHECK (min_subtotal >= 0),
  description text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT promos_pkey PRIMARY KEY (id)
);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_promos_code ON public.promos (code);

-- Enable RLS
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access to active promos" ON public.promos;
DROP POLICY IF EXISTS "Allow admin write access to promos" ON public.promos;

CREATE POLICY "Allow public read access to active promos"
  ON public.promos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow admin write access to promos"
  ON public.promos FOR ALL
  USING (true)
  WITH CHECK (true);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promos TO anon, authenticated, service_role;

-- Initial Seed Data
INSERT INTO public.promos (id, code, name, type, value, max_discount, min_subtotal, description)
VALUES
  (gen_random_uuid(), 'AQUA10', 'Aquascaper 10% Discount', 'percentage', 10, 50000, 50000, '10% OFF on your order (Max Rp 50.000, Min order Rp 50.000)'),
  (gen_random_uuid(), 'FREESHIP', 'Free Shipping Discount', 'shipping', 15000, 15000, 75000, 'Rp 15.000 Shipping Fee Discount (Min order Rp 75.000)'),
  (gen_random_uuid(), 'NEWUSER', 'New User Special', 'fixed', 25000, 25000, 100000, 'Rp 25.000 Flat Discount for new aquascapers (Min order Rp 100.000)'),
  (gen_random_uuid(), 'AQUASCAPE25', '25% Mega Discount', 'percentage', 25, 100000, 200000, '25% Mega Aquascape Discount (Max Rp 100.000, Min order Rp 200.000)')
ON CONFLICT (code) DO NOTHING;

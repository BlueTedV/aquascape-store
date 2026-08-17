-- Supabase SQL Schema for Hero Slides
-- Run this script in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  eyebrow text NOT NULL DEFAULT 'Special Offer',
  title text NOT NULL,
  body text NOT NULL,
  cta text NOT NULL DEFAULT 'Shop Now',
  filter text NOT NULL DEFAULT 'all',
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hero_slides_pkey PRIMARY KEY (id)
);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_hero_slides_created ON public.hero_slides (created_at DESC);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access to hero_slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Allow admin write access to hero_slides" ON public.hero_slides;

CREATE POLICY "Allow public read access to hero_slides"
  ON public.hero_slides FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write access to hero_slides"
  ON public.hero_slides FOR ALL
  USING (true)
  WITH CHECK (true);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO anon, authenticated, service_role;

-- Initial Seed Data
INSERT INTO public.hero_slides (id, eyebrow, title, body, cta, filter, image_url)
VALUES
  (gen_random_uuid(), 'Weekend sale', 'Hardscape bundles up to 25% off', 'Curated stone and wood packs for nano tanks through 90P layouts.', 'Shop Sale Items', 'sale', '/images/home/promo-sale.svg'),
  (gen_random_uuid(), 'Fresh arrival', 'New tissue culture plants landed', 'Clean, pest-free cups for carpeting, moss walls, and high-light stems.', 'See New Items', 'new', '/images/home/promo-new.svg'),
  (gen_random_uuid(), 'Promo kit', 'CO2 and lighting starter combos', 'High-output WRGB fixtures bundled with twin-gauge regulators.', 'Explore Kits', 'featured', '/images/home/promo-kit.svg')
ON CONFLICT DO NOTHING;

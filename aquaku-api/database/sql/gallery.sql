-- Supabase SQL Schema for Community Gallery Posts & User Likes
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE TABLE IF NOT EXISTS public.gallery_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Aquascaper',
  title text NOT NULL,
  description text,
  tank_specs text,
  image_url text NOT NULL,
  size text NOT NULL DEFAULT 'wide' CHECK (size IN ('tall', 'square', 'wide')),
  likes_count integer NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT gallery_posts_pkey PRIMARY KEY (id)
);

-- Table for tracking individual user likes (prevents repeat/inflated liking)
CREATE TABLE IF NOT EXISTS public.gallery_post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.gallery_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT gallery_post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT gallery_post_likes_post_user_unique UNIQUE (post_id, user_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_posts_likes ON public.gallery_posts (likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_posts_created ON public.gallery_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_post_likes_user ON public.gallery_post_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_post_likes_post ON public.gallery_post_likes (post_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.gallery_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_post_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script
DROP POLICY IF EXISTS "Allow public read access to gallery_posts" ON public.gallery_posts;
DROP POLICY IF EXISTS "Allow authenticated insert into gallery_posts" ON public.gallery_posts;
DROP POLICY IF EXISTS "Allow public update of likes_count on gallery_posts" ON public.gallery_posts;
DROP POLICY IF EXISTS "Allow public read access to gallery_post_likes" ON public.gallery_post_likes;
DROP POLICY IF EXISTS "Allow authenticated user likes" ON public.gallery_post_likes;

-- Policies for gallery_posts
CREATE POLICY "Allow public read access to gallery_posts"
  ON public.gallery_posts FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert into gallery_posts"
  ON public.gallery_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update of likes_count on gallery_posts"
  ON public.gallery_posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for gallery_post_likes
CREATE POLICY "Allow public read access to gallery_post_likes"
  ON public.gallery_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated user likes"
  ON public.gallery_post_likes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Permissions for API Roles
GRANT SELECT, INSERT, UPDATE ON public.gallery_posts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, DELETE ON public.gallery_post_likes TO anon, authenticated, service_role;

-- Seed Initial Community Showcase Creations
INSERT INTO public.gallery_posts (id, title, author_name, description, tank_specs, image_url, size, likes_count)
VALUES
  (gen_random_uuid(), '60P Mountain Iwagumi', 'Budi Santoso', 'A minimalist 60cm Iwagumi aquascape featuring Seiryu stones, Hemianthus callitrichoides carpet, and Cardinal Tetras.', '60x30x36cm Ultra Clear | RGB+W Lighting | Pressurized CO2', '/images/home/gallery-1.svg', 'tall', 142),
  (gen_random_uuid(), 'Nano Canopy Ecosystem', 'Maya Putri', 'Top-down view of a 30cm cube featuring floating Salvinia, Bucephalandra, and Crystal Red Shrimp.', '30cm Cube | Hang-on Filter | Low CO2', '/images/home/gallery-2.svg', 'square', 98),
  (gen_random_uuid(), 'Jungle Driftwood Sanctuary', 'Andra Wicaksono', 'Dark mood hardscape featuring ancient Mangrove wood, Java Moss, and cosmetic white sand winding pathway.', '90x45x45cm | Twin Canister Filter | High Light', '/images/home/gallery-3.svg', 'wide', 215),
  (gen_random_uuid(), '120P Dutch Garden Symphony', 'Rizky Pratama', 'Vibrant high-Dutch layout with Rotala H''Ra, Ludwigia Super Red, and 50 schooling Cardinal Tetras.', '120x50x50cm | Inline CO2 Diffuser | Daily Tropica Dosing', '/images/home/gallery-4.svg', 'tall', 176)
ON CONFLICT DO NOTHING;

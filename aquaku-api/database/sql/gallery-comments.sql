-- Supabase SQL Schema for Community Gallery Post Comments
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create comments table
CREATE TABLE IF NOT EXISTS public.gallery_post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.gallery_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Aquascaper',
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT gallery_post_comments_pkey PRIMARY KEY (id)
);

-- 2. Add comments_count column to gallery_posts if not exists
ALTER TABLE public.gallery_posts 
ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0 CHECK (comments_count >= 0);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_post_comments_post ON public.gallery_post_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_gallery_post_comments_created ON public.gallery_post_comments (created_at ASC);
CREATE INDEX IF NOT EXISTS idx_gallery_post_comments_user ON public.gallery_post_comments (user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.gallery_post_comments ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if re-running script
DROP POLICY IF EXISTS "Allow public read access to gallery_post_comments" ON public.gallery_post_comments;
DROP POLICY IF EXISTS "Allow public insert into gallery_post_comments" ON public.gallery_post_comments;
DROP POLICY IF EXISTS "Allow delete on gallery_post_comments" ON public.gallery_post_comments;

-- 6. Policies
CREATE POLICY "Allow public read access to gallery_post_comments"
  ON public.gallery_post_comments FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert into gallery_post_comments"
  ON public.gallery_post_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow delete on gallery_post_comments"
  ON public.gallery_post_comments FOR DELETE
  USING (true);

-- 7. Permissions for API Roles
GRANT SELECT, INSERT, DELETE, UPDATE ON public.gallery_post_comments TO anon, authenticated, service_role;

-- 8. Seed Initial Comments for Seeded Posts
DO $$
DECLARE
  v_post1 uuid;
  v_post2 uuid;
  v_post3 uuid;
BEGIN
  SELECT id INTO v_post1 FROM public.gallery_posts WHERE title ILIKE '%Iwagumi%' LIMIT 1;
  SELECT id INTO v_post2 FROM public.gallery_posts WHERE title ILIKE '%Canopy%' LIMIT 1;
  SELECT id INTO v_post3 FROM public.gallery_posts WHERE title ILIKE '%Driftwood%' LIMIT 1;

  IF v_post1 IS NOT NULL THEN
    INSERT INTO public.gallery_post_comments (post_id, author_name, content, created_at)
    VALUES
      (v_post1, 'Aris Setiawan', 'Stunning Seiryu stone placement! Did you use cyanoacrylate glue for the rock joins?', now() - interval '2 days'),
      (v_post1, 'Dewi Lestari', 'The Monte Carlo carpet is remarkably compact. How many watts of lighting are you running?', now() - interval '1 day')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_post2 IS NOT NULL THEN
    INSERT INTO public.gallery_post_comments (post_id, author_name, content, created_at)
    VALUES
      (v_post2, 'Hendro Kusuma', 'Such clean top-down perspective. Are the Crystal Red Shrimps breeding actively?', now() - interval '18 hours')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_post3 IS NOT NULL THEN
    INSERT INTO public.gallery_post_comments (post_id, author_name, content, created_at)
    VALUES
      (v_post3, 'Rian Pratama', 'The shadow play with the mangrove wood creates an authentic Amazonian riverbed atmosphere!', now() - interval '12 hours')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 9. Update comments_count on gallery_posts to reflect seeded comments
UPDATE public.gallery_posts p
SET comments_count = (
  SELECT count(*) FROM public.gallery_post_comments c WHERE c.post_id = p.id
);

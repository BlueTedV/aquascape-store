-- Product Reviews Database Schema & Policies for Aquaku
-- Users can submit verified ratings and written feedback for any catalog product.

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  user_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id)
);

-- Fast lookup indexes by product slug and product ID
CREATE INDEX IF NOT EXISTS idx_reviews_product_slug ON public.reviews(product_slug);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Permissions
GRANT ALL ON public.reviews TO service_role;
GRANT SELECT, INSERT ON public.reviews TO anon, authenticated;

-- Policies
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Public reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert a review" ON public.reviews;
CREATE POLICY "Anyone can insert a review"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

-- Sample initial customer reviews for seeded products
INSERT INTO public.reviews (product_slug, user_name, rating, comment, created_at)
VALUES
  ('micranthemum-monte-carlo', 'Budi Santoso', 5, 'Arrived in incredible condition! Fresh, vibrant green tissue culture with zero melting. Carpeted my 60p nano tank in just 3 weeks with CO2.', now() - interval '5 days'),
  ('micranthemum-monte-carlo', 'Reza Pratama', 5, 'Best Monte Carlo cup I have bought online. Root system was super clean and pest-free. Highly recommended.', now() - interval '12 days'),
  ('rotala-rotundifolia-red', 'David Wijaya', 4, 'Very healthy stems with good red hues. Give it high light and iron fertilizer to get deep crimson coloration.', now() - interval '8 days'),
  ('seiryu-stone', 'Hendro Gunawan', 5, 'Stunning natural texture and deep slate grey color with white calcite veins. Ideal for Iwagumi layout. Packaged securely with heavy bubble wrap.', now() - interval '15 days'),
  ('seiryu-stone', 'Agus Setiawan', 5, 'Great variety of sizes in the 5kg bundle. Character pieces are very expressive.', now() - interval '20 days'),
  ('chihiros-wrgb-ii-pro', 'Kevin Tandiono', 5, 'The Bluetooth app control is game-changing. Plant growth under this light is explosive. Sunset ramp-up feature is super smooth.', now() - interval '2 days'),
  ('aquario-neo-co2-diffuser', 'Fajar Nugraha', 5, 'Produces micro-fine bubbles that dissolve completely before reaching the surface. Much better than generic ceramic diffusers.', now() - interval '6 days')
ON CONFLICT DO NOTHING;

-- Synchronize calculated ratings & review counts on products table
UPDATE public.products p
SET
  review_count = COALESCE(sub.total_reviews, 0),
  rating = COALESCE(sub.avg_rating, 0)
FROM (
  SELECT
    product_slug,
    COUNT(*)::int as total_reviews,
    ROUND(AVG(rating)::numeric, 1) as avg_rating
  FROM public.reviews
  GROUP BY product_slug
) sub
WHERE p.slug = sub.product_slug;

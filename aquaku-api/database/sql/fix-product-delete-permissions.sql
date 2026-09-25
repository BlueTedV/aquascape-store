-- Migration: Fix permissions and foreign key constraints for Product Deletion
-- Run this script in the Supabase Dashboard > SQL Editor to resolve "permission denied for table products"

-- 1. Grant table-level permissions to service_role (used by Laravel backend)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON public.reviews TO service_role;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;

-- Ensure future tables in public schema grant full permissions to service_role
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;

-- 2. Configure Row Level Security (RLS) policies on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access on products" ON public.products;
CREATE POLICY "Service role full access on products"
  ON public.products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Fix Foreign Key constraints so deleting a product doesn't trigger 500 constraint violations
-- (a) order_items: detach product_id as NULL when product is deleted (preserves invoice data)
ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES public.products(id)
  ON DELETE SET NULL;

-- (b) reviews: cascade delete reviews associated with the deleted product
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES public.products(id)
  ON DELETE CASCADE;

-- Schema for Orders & Order Items in Supabase

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  shipping_postal_code text NOT NULL,
  courier text NOT NULL,
  shipping_cost integer NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid',
  order_status text NOT NULL DEFAULT 'pending',
  subtotal integer NOT NULL DEFAULT 0,
  total_amount integer NOT NULL DEFAULT 0,
  notes text,
  shipping_resi text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

-- Migration statement if table already exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_resi text;

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_slug text NOT NULL,
  product_image text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal integer NOT NULL CHECK (subtotal >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

-- RLS & Grants
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;

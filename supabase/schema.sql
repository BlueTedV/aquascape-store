-- Aqua Studio starter schema for Supabase
-- Run this in Supabase Dashboard > SQL Editor.

create extension if not exists "pgcrypto";


-- User profile and shipping data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  province text not null,
  postal_code text not null,
  country text not null default 'Indonesia',
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists shipping_addresses_one_default_idx
  on public.shipping_addresses(user_id, is_default)
  where is_default;

alter table public.profiles enable row level security;
alter table public.shipping_addresses enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can read own addresses" on public.shipping_addresses;
create policy "Users can read own addresses"
  on public.shipping_addresses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own addresses" on public.shipping_addresses;
create policy "Users can insert own addresses"
  on public.shipping_addresses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own addresses" on public.shipping_addresses;
create policy "Users can update own addresses"
  on public.shipping_addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own addresses" on public.shipping_addresses;
create policy "Users can delete own addresses"
  on public.shipping_addresses for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_slug text not null references public.categories(slug),
  collection text not null,
  brand text not null,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= price),
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  image_url text not null,
  badge text check (badge in ('New', 'Best Seller', 'Premium')),
  featured boolean not null default false,
  stock integer not null default 0 check (stock >= 0),
  on_sale boolean not null default false,
  unit text,
  arrival boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists products_category_slug_idx on public.products(category_slug);
create index if not exists products_collection_idx on public.products(collection);
create index if not exists products_brand_idx on public.products(brand);
create index if not exists products_tags_idx on public.products using gin(tags);
create index if not exists products_search_idx on public.products using gin(
  to_tsvector('english', name || ' ' || category_slug || ' ' || collection || ' ' || brand)
);

alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "Anyone can read categories" on public.categories;
create policy "Anyone can read categories"
  on public.categories for select
  using (true);

drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products"
  on public.products for select
  using (true);

-- Keep writes locked down for now. Use the service role key from trusted server code,
-- or add authenticated/admin policies later when you build a dashboard.

insert into public.categories (slug, name) values
  ('plants', 'Plants'),
  ('hardscape', 'Hardscape'),
  ('fish', 'Fish'),
  ('shrimp', 'Shrimp'),
  ('equipment', 'Equipment'),
  ('others', 'Others')
on conflict (slug) do update set name = excluded.name;

insert into public.products (
  slug, name, category_slug, collection, brand, price, compare_at_price,
  rating, review_count, image_url, badge, featured, stock, on_sale, unit, arrival, tags
) values
  ('premium-dragon-stone', 'Premium Dragon Stone', 'hardscape', 'Dragon Stone', 'Aqua Studio', 85000, 110000, 4.9, 24, 'https://picsum.photos/seed/aqua-premium-dragon-stone/600/480', 'New', true, 24, true, 'kg', true, array['Iwagumi','NatureAquarium','NanoTank']),
  ('spider-wood-medium', 'Spider Wood Medium', 'hardscape', 'Spider Wood', 'ADA', 125000, null, 4.7, 15, 'https://picsum.photos/seed/aqua-spider-wood-medium/600/480', null, true, 15, false, null, false, array['NatureAquarium','JungleStyle','Woodscape']),
  ('hc-cuba-tissue-culture', 'HC Cuba Tissue Culture', 'plants', 'Tissue Culture', 'Twinstar', 45000, null, 5.0, 18, 'https://picsum.photos/seed/aqua-hc-cuba-cup/600/480', 'Best Seller', false, 36, false, 'cup', false, array['DutchStyle','Iwagumi','CarpetPlants']),
  ('studio-pro-led-60cm', 'Studio Pro LED 60cm', 'equipment', 'Lighting', 'Aqua Studio', 1450000, 1650000, 4.8, 31, 'https://picsum.photos/seed/aqua-studio-pro-led-60cm/600/480', 'Premium', true, 8, true, null, false, array['DutchStyle','NatureAquarium','HighTech']),
  ('crystalflow-filter-300', 'CrystalFlow Filter 300', 'equipment', 'Filtration', 'UNS', 2890000, null, 4.9, 20, 'https://picsum.photos/seed/aqua-filter-300/600/480', null, false, 5, false, null, false, array['NatureAquarium','HighTech','CleanLayout']),
  ('red-cherry-shrimp-grade-a', 'Red Cherry Shrimp Grade A', 'shrimp', 'Neocaridina', 'Aqua Studio', 12000, null, 4.8, 42, 'https://picsum.photos/seed/aqua-red-cherry-shrimp/600/480', 'New', false, 60, false, 'pc', true, array['JungleStyle','NatureAquarium','NanoTank'])
on conflict (slug) do update set
  name = excluded.name,
  category_slug = excluded.category_slug,
  collection = excluded.collection,
  brand = excluded.brand,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  rating = excluded.rating,
  review_count = excluded.review_count,
  image_url = excluded.image_url,
  badge = excluded.badge,
  featured = excluded.featured,
  stock = excluded.stock,
  on_sale = excluded.on_sale,
  unit = excluded.unit,
  arrival = excluded.arrival,
  tags = excluded.tags;
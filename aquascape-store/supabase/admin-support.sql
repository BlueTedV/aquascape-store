-- Run once in Supabase Dashboard > SQL Editor before using the Laravel admin product editor.
-- This keeps Next.js as the frontend while Laravel owns auth/account/admin API work.

alter table public.products
  add column if not exists description text,
  add column if not exists gallery_urls text[] not null default '{}'::text[],
  add column if not exists specs jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists role text not null default 'customer';
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('customer', 'admin'));
  end if;
end $$;

grant usage on schema public to anon, authenticated, service_role;

grant select on public.categories to anon, authenticated, service_role;
grant select on public.products to anon, authenticated, service_role;
grant select, insert, update on public.products to service_role;
grant select, insert, update on public.profiles to service_role;
grant select, insert, update on public.shipping_addresses to service_role;

alter default privileges in schema public grant select on tables to anon, authenticated, service_role;
alter default privileges in schema public grant select, insert, update on tables to service_role;

-- Bootstrap admin access by using one of these options:
-- 1. Add one or more emails to ADMIN_EMAILS in Laravel .env, for example ADMIN_EMAILS=you@example.com,partner@example.com
-- 2. Or run this after replacing the email:
-- update public.profiles set role = 'admin' where id = (
--   select id from auth.users where email = 'you@example.com' limit 1
-- );
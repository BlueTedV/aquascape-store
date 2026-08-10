-- Run this once in Supabase Dashboard > SQL Editor if catalog APIs fail with 42501.
-- Scope is limited to public catalog tables only.

grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories to anon, authenticated, service_role;
grant select on public.products to anon, authenticated, service_role;
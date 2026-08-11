-- Optional cleanup: run once if old mock product rows still contain picsum.photos URLs.
-- After this, products without uploaded photos use the local frontend placeholder.

update public.products
set image_url = '/images/products/product-placeholder.svg'
where image_url like 'https://picsum.photos/%'
   or image_url like 'https://fastly.picsum.photos/%';

update public.products
set gallery_urls = '{}'::text[]
where exists (
  select 1
  from unnest(gallery_urls) as image
  where image like 'https://picsum.photos/%'
     or image like 'https://fastly.picsum.photos/%'
);
-- Picksy Store: add support for multiple product images
alter table public.products
add column if not exists images text[] default '{}';

update public.products
set images = case
  when image is null or trim(image) = '' then '{}'
  else array[image]
end
where images is null or cardinality(images) = 0;

alter table public.products
alter column images set default '{}';

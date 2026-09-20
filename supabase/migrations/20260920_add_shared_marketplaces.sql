-- Picksy Store: shared marketplace management
create table if not exists public.marketplaces (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.marketplaces enable row level security;

drop policy if exists "Public can read marketplaces" on public.marketplaces;
create policy "Public can read marketplaces"
  on public.marketplaces
  for select
  using (true);

drop policy if exists "Authenticated admins can manage marketplaces" on public.marketplaces;
create policy "Authenticated admins can manage marketplaces"
  on public.marketplaces
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.marketplaces (name, slug)
values
  ('Amazon', 'amazon'),
  ('Flipkart', 'flipkart'),
  ('Meesho', 'meesho')
on conflict (name) do nothing;

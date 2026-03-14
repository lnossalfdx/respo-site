create extension if not exists pgcrypto;

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_path text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "Public read photos" on public.photos;
create policy "Public read photos"
on public.photos
for select
to public
using (true);

drop policy if exists "Service role insert photos" on public.photos;
create policy "Service role insert photos"
on public.photos
for insert
to service_role
with check (true);

insert into storage.buckets (id, name, public)
values ('wall-of-fame', 'wall-of-fame', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public read wall of fame images" on storage.objects;
create policy "Public read wall of fame images"
on storage.objects
for select
to public
using (bucket_id = 'wall-of-fame');

drop policy if exists "Service role upload wall of fame images" on storage.objects;
create policy "Service role upload wall of fame images"
on storage.objects
for insert
to service_role
with check (bucket_id = 'wall-of-fame');

-- ============================================================
-- PortfolioSite — Supabase Schema
-- Run this entire file in: Supabase Dashboard > SQL Editor
-- ============================================================

-- portfolios table
create table if not exists public.portfolios (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  slug        text not null unique,
  name        text,
  role        text,
  college     text,
  bio         text,
  avatar_url  text,
  skills      text[] default '{}',
  projects    jsonb  default '[]',
  socials     jsonb  default '{}',
  theme       text   default 'dark',
  accent      text   default 'purple',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- slug must be lowercase alphanumeric + hyphens only
alter table public.portfolios
  add constraint slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$');

-- index for fast slug lookups (every portfolio page load)
create index if not exists portfolios_slug_idx on public.portfolios(slug);
create index if not exists portfolios_user_idx on public.portfolios(user_id);

-- ── Row Level Security ──────────────────────────────────────
alter table public.portfolios enable row level security;

-- Anyone can read any portfolio (needed for subdomain pages)
create policy "Public portfolios are readable by all"
  on public.portfolios for select
  using (true);

-- Only the owner can insert their own portfolio
create policy "Users can create their own portfolio"
  on public.portfolios for insert
  with check (auth.uid() = user_id);

-- Only the owner can update their own portfolio
create policy "Users can update their own portfolio"
  on public.portfolios for update
  using (auth.uid() = user_id);

-- Only the owner can delete their own portfolio
create policy "Users can delete their own portfolio"
  on public.portfolios for delete
  using (auth.uid() = user_id);

-- ── Storage bucket for avatars ──────────────────────────────
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict do nothing;

-- Anyone can read avatars (they're shown on public portfolios)
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Only authenticated users can upload to their own folder
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

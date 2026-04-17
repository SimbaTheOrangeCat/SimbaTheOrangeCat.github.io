-- Mindfactor Supabase setup
-- Run this entire script once in Supabase SQL Editor.

-- Optional but recommended for UUID generation convenience
create extension if not exists pgcrypto;

-- =========================================================
-- Tables
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role text not null default 'reader' check (role in ('reader', 'admin')),
  accent_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  post_path text not null,
  author_name text not null,
  content text not null,
  parent_id uuid null references public.comments(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_path text not null,
  emoji text not null,
  created_at timestamptz not null default now(),
  constraint reactions_user_post_unique unique (user_id, post_path)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  content text not null,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists comments_post_path_idx on public.comments(post_path);
create index if not exists comments_parent_id_idx on public.comments(parent_id);
create index if not exists reactions_post_path_idx on public.reactions(post_path);
create index if not exists journal_entries_user_created_idx on public.journal_entries(user_id, created_at desc);

-- =========================================================
-- Utility functions
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
before update on public.journal_entries
for each row execute function public.set_updated_at();

-- role helper used in policies
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- =========================================================
-- RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.journal_entries enable row level security;

-- Profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only"
on public.profiles
for delete
to authenticated
using (public.is_admin());

-- Comments
-- Public can read comments
drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public"
on public.comments
for select
to anon, authenticated
using (true);

-- Anyone (even anonymous) can insert comments
drop policy if exists "comments_insert_public" on public.comments;
create policy "comments_insert_public"
on public.comments
for insert
to anon, authenticated
with check (true);

-- Only admins can delete comments
drop policy if exists "comments_delete_admin_only" on public.comments;
create policy "comments_delete_admin_only"
on public.comments
for delete
to authenticated
using (public.is_admin());

-- Reactions
-- Everyone can read reaction counts
drop policy if exists "reactions_select_public" on public.reactions;
create policy "reactions_select_public"
on public.reactions
for select
to anon, authenticated
using (true);

-- Signed-in users can create/update/delete only their own reaction rows
drop policy if exists "reactions_insert_own" on public.reactions;
create policy "reactions_insert_own"
on public.reactions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "reactions_update_own" on public.reactions;
create policy "reactions_update_own"
on public.reactions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "reactions_delete_own" on public.reactions;
create policy "reactions_delete_own"
on public.reactions
for delete
to authenticated
using (user_id = auth.uid());

-- Journal entries
-- Signed-in users can fully manage only their own entries
drop policy if exists "journal_select_own" on public.journal_entries;
create policy "journal_select_own"
on public.journal_entries
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "journal_insert_own" on public.journal_entries;
create policy "journal_insert_own"
on public.journal_entries
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "journal_update_own" on public.journal_entries;
create policy "journal_update_own"
on public.journal_entries
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "journal_delete_own" on public.journal_entries;
create policy "journal_delete_own"
on public.journal_entries
for delete
to authenticated
using (user_id = auth.uid());

-- =========================================================
-- Optional storage bucket for journal image uploads
-- (safe to keep even if current Next component doesn't upload yet)
-- =========================================================

insert into storage.buckets (id, name, public)
values ('journal-images', 'journal-images', true)
on conflict (id) do nothing;

drop policy if exists "journal_images_public_read" on storage.objects;
create policy "journal_images_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'journal-images');

drop policy if exists "journal_images_upload_own_folder" on storage.objects;
create policy "journal_images_upload_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'journal-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "journal_images_delete_own_folder" on storage.objects;
create policy "journal_images_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'journal-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

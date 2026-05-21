-- ============================================================
-- ANIMELIST — SCHEMA
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- HELPER FUNCTION: is_admin()
-- SECURITY DEFINER so it bypasses RLS when checking own role
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- ============================================================
-- TABLE: profiles
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null unique,
  email        text not null unique,
  role         text not null default 'user'
                 check (role in ('user', 'admin')),
  avatar_url   text,
  banned_until timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- TABLE: animes
-- ============================================================
create table public.animes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null check (char_length(title) >= 1 and char_length(title) <= 200),
  description text check (char_length(description) <= 2000),
  poster_url  text not null,
  watch_url   text not null check (
                watch_url ~* '^https?://(www\.)?(youtube\.com|youtu\.be|vimeo\.com|crunchyroll\.com|animationdigitalnetwork\.fr|wakanim\.tv|animeunity\.to|nyaa\.si|dailymotion\.com)(\/.*)?$'
              ),
  genre       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- TABLE: playlists
-- ============================================================
create table public.playlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null check (char_length(name) >= 1 and char_length(name) <= 100),
  description text check (char_length(description) <= 500),
  is_public   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- TABLE: playlist_items
-- ============================================================
create table public.playlist_items (
  id          uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  anime_id    uuid not null references public.animes(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (playlist_id, anime_id)
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  message    text not null,
  reason     text,
  type       text not null default 'admin',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLE: moderation_logs
-- ============================================================
create table public.moderation_logs (
  id              uuid primary key default gen_random_uuid(),
  admin_id        uuid references public.profiles(id) on delete set null,
  target_user_id  uuid references public.profiles(id) on delete set null,
  target_anime_id uuid references public.animes(id) on delete set null,
  action          text not null,
  reason          text not null check (char_length(reason) >= 10),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index animes_user_id_idx        on public.animes(user_id);
create index animes_created_at_idx     on public.animes(created_at desc);
create index animes_genre_idx          on public.animes(genre) where genre is not null;
create index notifications_user_idx    on public.notifications(user_id, read);
create index playlist_items_pid_idx   on public.playlist_items(playlist_id);
create index playlists_user_id_idx     on public.playlists(user_id);
create index profiles_username_idx     on public.profiles(username);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: update updated_at automatically
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger animes_updated_at
  before update on public.animes
  for each row execute function public.set_updated_at();

create trigger playlists_updated_at
  before update on public.playlists
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

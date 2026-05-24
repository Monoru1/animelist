-- ═══════════════════════════════════════════════════════════════════
-- ANIMELIST — Migration complète Supabase
-- Coller intégralement dans Supabase > SQL Editor > New query
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. FAVORITES ──────────────────────────────────────────────────
create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  anime_id    uuid not null references public.animes(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, anime_id)
);
alter table public.favorites enable row level security;
drop policy if exists "favorites_select" on public.favorites;
drop policy if exists "favorites_insert" on public.favorites;
drop policy if exists "favorites_delete" on public.favorites;
create policy "favorites_select" on public.favorites for select using (auth.uid() = user_id);
create policy "favorites_insert" on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete" on public.favorites for delete using (auth.uid() = user_id);

-- ── 2. ANIME_EPISODES ─────────────────────────────────────────────
create table if not exists public.anime_episodes (
  id              uuid primary key default gen_random_uuid(),
  anime_id        uuid not null references public.animes(id) on delete cascade,
  season_number   int not null default 1,
  episode_number  int not null,
  title           text,
  synopsis        text,
  thumbnail_url   text,
  duration_sec    int,
  created_at      timestamptz not null default now(),
  unique(anime_id, season_number, episode_number)
);
alter table public.anime_episodes enable row level security;
drop policy if exists "episodes_public_read" on public.anime_episodes;
drop policy if exists "episodes_admin_all"   on public.anime_episodes;
create policy "episodes_public_read" on public.anime_episodes for select using (true);
create policy "episodes_admin_all"   on public.anime_episodes for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ── 3. EPISODE_SOURCES ────────────────────────────────────────────
create table if not exists public.episode_sources (
  id             uuid primary key default gen_random_uuid(),
  episode_id     uuid not null references public.anime_episodes(id) on delete cascade,
  label          text not null,
  language       text not null default 'VOSTFR',
  quality        text not null default 'HD',
  source_url     text not null,
  source_type    text not null default 'embed',
  provider_name  text,
  is_default     boolean not null default false,
  is_active      boolean not null default true,
  status         text not null default 'active',
  created_by     uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  last_checked   timestamptz
);
alter table public.episode_sources enable row level security;
drop policy if exists "sources_public_read" on public.episode_sources;
drop policy if exists "sources_admin_all"   on public.episode_sources;
create policy "sources_public_read" on public.episode_sources for select using (is_active = true);
create policy "sources_admin_all"   on public.episode_sources for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ── 4. WATCH_HISTORY ──────────────────────────────────────────────
create table if not exists public.watch_history (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  anime_id         uuid not null references public.animes(id) on delete cascade,
  progress_seconds int not null default 0,
  last_watched_at  timestamptz not null default now(),
  unique(user_id, anime_id)
);
alter table public.watch_history enable row level security;
drop policy if exists "history_select" on public.watch_history;
drop policy if exists "history_upsert" on public.watch_history;
create policy "history_select" on public.watch_history for select using (auth.uid() = user_id);
create policy "history_upsert" on public.watch_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 5. WATCH_PROGRESS ─────────────────────────────────────────────
create table if not exists public.watch_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  anime_id         uuid not null references public.animes(id) on delete cascade,
  episode_id       uuid references public.anime_episodes(id) on delete set null,
  progress_seconds int not null default 0,
  completed        boolean not null default false,
  updated_at       timestamptz not null default now(),
  unique(user_id, anime_id)
);
alter table public.watch_progress enable row level security;
drop policy if exists "progress_select" on public.watch_progress;
drop policy if exists "progress_upsert" on public.watch_progress;
create policy "progress_select" on public.watch_progress for select using (auth.uid() = user_id);
create policy "progress_upsert" on public.watch_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 6. SOURCE_REPORTS ─────────────────────────────────────────────
create table if not exists public.source_reports (
  id           uuid primary key default gen_random_uuid(),
  source_id    uuid references public.episode_sources(id) on delete set null,
  anime_id     uuid references public.animes(id) on delete cascade,
  episode_id   uuid references public.anime_episodes(id) on delete set null,
  reported_by  uuid references auth.users(id) on delete set null,
  reason       text not null default 'Source cassée',
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
alter table public.source_reports enable row level security;
drop policy if exists "reports_insert" on public.source_reports;
drop policy if exists "reports_admin"  on public.source_reports;
create policy "reports_insert" on public.source_reports for insert with check (auth.uid() is not null);
create policy "reports_admin"  on public.source_reports for select
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ── 7. WATCH_CHAT_MESSAGES ────────────────────────────────────────
create table if not exists public.watch_chat_messages (
  id          uuid primary key default gen_random_uuid(),
  anime_id    uuid not null references public.animes(id) on delete cascade,
  episode_id  uuid references public.anime_episodes(id) on delete set null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  username    text not null,
  message     text not null check (char_length(message) <= 300),
  is_deleted  boolean not null default false,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.watch_chat_messages enable row level security;
drop policy if exists "chat_select" on public.watch_chat_messages;
drop policy if exists "chat_insert" on public.watch_chat_messages;
drop policy if exists "chat_delete" on public.watch_chat_messages;
create policy "chat_select" on public.watch_chat_messages for select using (is_deleted = false);
create policy "chat_insert" on public.watch_chat_messages for insert with check (auth.uid() = user_id);
create policy "chat_delete" on public.watch_chat_messages for update
  using (auth.uid() = user_id or (select role from public.profiles where id = auth.uid()) = 'admin');

-- Activer Realtime sur watch_chat_messages
alter publication supabase_realtime add table public.watch_chat_messages;

-- ── 8. NOTIFICATIONS — s'assurer que la colonne read existe ───────
-- (la table existe déjà selon database.types.ts)
alter table public.notifications
  add column if not exists read boolean not null default false;
alter table public.notifications
  add column if not exists type text not null default 'info';
alter table public.notifications
  add column if not exists target_type text not null default 'user';
alter table public.notifications
  add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.notifications
  add column if not exists expires_at timestamptz;

-- RLS notifications : user voit ses propres notifs + les globales
alter table public.notifications enable row level security;
drop policy if exists "notif_select" on public.notifications;
drop policy if exists "notif_insert" on public.notifications;
drop policy if exists "notif_update" on public.notifications;
create policy "notif_select" on public.notifications for select
  using (
    user_id = auth.uid()
    or target_type = 'global'
  );
create policy "notif_insert" on public.notifications for insert
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "notif_update" on public.notifications for update
  using (user_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin');

-- ── 9. Mettre à jour database.types.ts (commentaire référence) ────
-- Après avoir exécuté cette migration, regénère les types via :
-- supabase gen types typescript --project-id TON_PROJECT_ID > src/types/database.types.ts


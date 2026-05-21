-- ============================================================
-- ANIMELIST — RLS POLICIES
-- Run this SECOND, after schema.sql
-- ============================================================

-- ============================================================
-- profiles
-- ============================================================
alter table public.profiles enable row level security;

-- Everyone can read profiles (public library, user cards)
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

-- User can update only own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Only admins can delete profiles
create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin());

-- ============================================================
-- animes
-- ============================================================
alter table public.animes enable row level security;

-- Everyone can read animes
create policy "animes_select_public"
  on public.animes for select
  using (true);

-- Auth + not banned can insert
create policy "animes_insert_auth"
  on public.animes for insert
  with check (
    auth.uid() is not null
    and auth.uid() = user_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and (banned_until is null or banned_until < now())
    )
  );

-- Owner or admin can update
create policy "animes_update_own_or_admin"
  on public.animes for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Owner or admin can delete
create policy "animes_delete_own_or_admin"
  on public.animes for delete
  using (auth.uid() = user_id or public.is_admin());

-- ============================================================
-- playlists
-- ============================================================
alter table public.playlists enable row level security;

-- Public playlists visible to all; private only to owner or admin
create policy "playlists_select"
  on public.playlists for select
  using (is_public = true or auth.uid() = user_id or public.is_admin());

-- Auth users can create playlists for themselves
create policy "playlists_insert_auth"
  on public.playlists for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

-- Owner or admin can update
create policy "playlists_update_own_or_admin"
  on public.playlists for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Owner or admin can delete
create policy "playlists_delete_own_or_admin"
  on public.playlists for delete
  using (auth.uid() = user_id or public.is_admin());

-- ============================================================
-- playlist_items
-- ============================================================
alter table public.playlist_items enable row level security;

-- Visible if the parent playlist is visible
create policy "playlist_items_select"
  on public.playlist_items for select
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id
      and (p.is_public = true or p.user_id = auth.uid() or public.is_admin())
    )
  );

-- Only playlist owner can insert items
create policy "playlist_items_insert_owner"
  on public.playlist_items for insert
  with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id
      and p.user_id = auth.uid()
    )
  );

-- Only playlist owner or admin can delete items
create policy "playlist_items_delete_owner_or_admin"
  on public.playlist_items for delete
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id
      and (p.user_id = auth.uid() or public.is_admin())
    )
  );

-- ============================================================
-- notifications
-- ============================================================
alter table public.notifications enable row level security;

-- User sees only own notifications
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Only admins can insert notifications
create policy "notifications_insert_admin"
  on public.notifications for insert
  with check (public.is_admin());

-- User can update own (mark as read)
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- moderation_logs
-- ============================================================
alter table public.moderation_logs enable row level security;

create policy "moderation_logs_select_admin"
  on public.moderation_logs for select
  using (public.is_admin());

create policy "moderation_logs_insert_admin"
  on public.moderation_logs for insert
  with check (public.is_admin());

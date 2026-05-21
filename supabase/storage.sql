-- ============================================================
-- ANIMELIST — STORAGE
-- Run this THIRD, after policies.sql
-- ============================================================

-- Create the anime-posters bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'anime-posters',
  'anime-posters',
  true,
  2097152,  -- 2 MB in bytes
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ============================================================
-- Storage policies on storage.objects
-- ============================================================

-- Public read: anyone can view poster files
create policy "posters_select_public"
  on storage.objects for select
  using (bucket_id = 'anime-posters');

-- Authenticated users can upload to their own folder: {user_id}/...
create policy "posters_insert_auth"
  on storage.objects for insert
  with check (
    bucket_id = 'anime-posters'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update files in their own folder; admins can update any
create policy "posters_update_own_or_admin"
  on storage.objects for update
  using (
    bucket_id = 'anime-posters'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- Users can delete files in their own folder; admins can delete any
create policy "posters_delete_own_or_admin"
  on storage.objects for delete
  using (
    bucket_id = 'anime-posters'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

import { supabase } from '@/services/supabaseClient'

export type LibraryAnime = {
  id: string
  user_id: string
  title: string
  description: string | null
  genre: string | null
  poster_url: string
  watch_url: string | null
  created_at: string
  profiles?: { username: string | null; avatar_url: string | null } | { username: string | null; avatar_url: string | null }[] | null
}

export async function fetchPublicAnimes(): Promise<LibraryAnime[]> {
  const { data, error } = await supabase
    .from('animes')
    .select('id,user_id,title,description,genre,poster_url,watch_url,created_at,profiles(username,avatar_url)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as LibraryAnime[]
}

export async function fetchAnimeById(animeId: string): Promise<LibraryAnime | null> {
  const { data, error } = await supabase
    .from('animes')
    .select('id,user_id,title,description,genre,poster_url,watch_url,created_at,profiles(username,avatar_url)')
    .eq('id', animeId)
    .single()

  if (error) throw error
  return (data ?? null) as unknown as LibraryAnime | null
}

export async function fetchMyAnimes(): Promise<LibraryAnime[]> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('animes')
    .select('id,user_id,title,description,genre,poster_url,watch_url,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function deleteAnimeById(id: string): Promise<void> {
  const { error } = await supabase.from('animes').delete().eq('id', id)
  if (error) throw error
}

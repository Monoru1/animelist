import { supabase } from '@/services/supabaseClient'

export type FavoriteAnime = {
  id: string
  title: string
  poster_url: string
  genre: string | null
  watch_url: string
}

export type FavoriteRow = {
  id: string
  created_at: string
  anime_id: string
  animes?: FavoriteAnime | FavoriteAnime[] | null
}

export function getFavoriteAnime(animes: FavoriteRow['animes']) {
  return Array.isArray(animes) ? animes[0] : animes
}

export async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function fetchFavorites(): Promise<FavoriteRow[]> {
  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('favorites')
    .select('id,created_at,anime_id,animes(id,title,poster_url,genre,watch_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as FavoriteRow[]
}

export async function addFavorite(animeId: string) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Session introuvable.')

  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, anime_id: animeId }, { onConflict: 'user_id,anime_id' })

  if (error) throw error
}

export async function removeFavorite(animeId: string) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Session introuvable.')

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('anime_id', animeId)

  if (error) throw error
}

export async function isFavorite(animeId: string) {
  const userId = await getCurrentUserId()
  if (!userId) return false

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('anime_id', animeId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

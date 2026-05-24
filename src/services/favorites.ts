import { supabase } from '@/services/supabaseClient'

export type FavoriteAnime = {
  id: string
  title: string
  poster_url: string
  genre: string | null
  watch_url: string | null
}

export type FavoriteRow = {
  id: string
  created_at: string
  anime_id: string
  anime: FavoriteAnime | null
}

export function getFavoriteAnime(row: FavoriteRow): FavoriteAnime | null {
  return row.anime ?? null
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

// Fetch en 2 étapes pour éviter les erreurs de foreign key Supabase
export async function fetchFavorites(): Promise<FavoriteRow[]> {
  const userId = await getUserId()
  if (!userId) return []

  // Étape 1 : récupérer les favoris
  const { data: favRows, error: favError } = await supabase
    .from('favorites')
    .select('id,created_at,anime_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (favError) {
    // Table favorites inexistante ou RLS — retourner [] silencieusement
    console.warn('[favorites] fetch error:', favError.message)
    return []
  }
  if (!favRows || favRows.length === 0) return []

  // Étape 2 : récupérer les animes correspondants
  const animeIds = favRows.map((r) => r.anime_id)
  const { data: animes } = await supabase
    .from('animes')
    .select('id,title,poster_url,genre,watch_url')
    .in('id', animeIds)

  const animeMap = new Map((animes ?? []).map((a) => [a.id, a as FavoriteAnime]))

  return favRows.map((row) => ({
    id: row.id,
    created_at: row.created_at,
    anime_id: row.anime_id,
    anime: animeMap.get(row.anime_id) ?? null,
  }))
}

export async function addFavorite(animeId: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) throw new Error('Non connecté.')

  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, anime_id: animeId }, { onConflict: 'user_id,anime_id' })

  if (error) throw new Error(error.message)
}

export async function removeFavorite(animeId: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) throw new Error('Non connecté.')

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('anime_id', animeId)

  if (error) throw new Error(error.message)
}

export async function isFavorite(animeId: string): Promise<boolean> {
  const userId = await getUserId()
  if (!userId) return false

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('anime_id', animeId)
    .maybeSingle()

  if (error) return false
  return Boolean(data)
}

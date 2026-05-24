import { supabase } from '@/services/supabaseClient'

export type HistoryAnime = {
  id: string
  title: string
  poster_url: string
  genre: string | null
  watch_url: string | null
}

export type HistoryRow = {
  id: string
  last_watched_at: string
  progress_seconds: number
  animes?: HistoryAnime | HistoryAnime[] | null
}

export function getHistoryAnime(animes: HistoryRow['animes']): HistoryAnime | null {
  return Array.isArray(animes) ? (animes[0] ?? null) : (animes ?? null)
}

export async function fetchWatchHistory(): Promise<HistoryRow[]> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('watch_history')
    .select('id,last_watched_at,progress_seconds,animes(id,title,poster_url,genre,watch_url)')
    .eq('user_id', userId)
    .order('last_watched_at', { ascending: false })
    .limit(24)

  if (error) throw error
  return (data ?? []) as unknown as HistoryRow[]
}

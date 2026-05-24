import { supabase } from '@/services/supabaseClient'

export type AdminAnime = {
  id: string
  user_id: string
  title: string
  poster_url: string
  watch_url: string | null
  genre: string | null
  created_at: string
}

export type AdminProfile = {
  id: string
  username: string
  email: string
  role: string
  created_at: string
}

export type AdminStats = {
  animeCount: number
  userCount: number
}

export async function fetchAdminAnimes(): Promise<AdminAnime[]> {
  const { data, error } = await supabase
    .from('animes')
    .select('id,user_id,title,poster_url,watch_url,genre,created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AdminAnime[]
}

export async function fetchAdminProfiles(): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,username,email,role,created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AdminProfile[]
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const [{ count: animeCount }, { count: userCount }] = await Promise.all([
    supabase.from('animes').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])
  return { animeCount: animeCount ?? 0, userCount: userCount ?? 0 }
}

export async function deleteAnimeAsAdmin(animeId: string, userId: string, title: string, reason: string, adminId: string): Promise<void> {
  const { error } = await supabase.from('animes').delete().eq('id', animeId)
  if (error) throw error

  await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Animé supprimé',
    message: `Ton animé « ${title} » a été supprimé par la modération.`,
    reason: reason.trim(),
    type: 'moderation',
  })

  await supabase.from('moderation_logs').insert({
    admin_id: adminId,
    target_user_id: userId,
    target_anime_id: animeId,
    action: 'delete_anime',
    reason: reason.trim(),
  })
}

export type EpisodeRow = { id: string; anime_id: string; episode_number: number }

function buildEpisodeUrl(template: string, episodeNumber: number): string {
  const value = template.trim()
  if (!value) return ''
  if (value.includes('{episode}')) return value.replaceAll('{episode}', String(episodeNumber))
  if (value.includes('{ep2}')) return value.replaceAll('{ep2}', String(episodeNumber).padStart(2, '0'))
  return episodeNumber === 1 ? value : ''
}

function sourceTypeFromUrl(url: string): string {
  const lower = url.toLowerCase()
  if (lower.includes('.mp4') || lower.includes('.webm')) return 'video'
  if (lower.includes('.m3u8')) return 'hls'
  return 'embed'
}

export async function addSourcePack(
  animeId: string,
  adminId: string,
  template: string,
  language: string,
  quality: string
): Promise<number> {
  const { data: episodes, error } = await supabase
    .from('anime_episodes')
    .select('id,anime_id,episode_number')
    .eq('anime_id', animeId)
    .order('episode_number', { ascending: true })

  if (error) throw error

  const rows = ((episodes ?? []) as EpisodeRow[])
    .map((ep) => ({ ep, url: buildEpisodeUrl(template, ep.episode_number) }))
    .filter((entry) => entry.url)
    .map((entry, idx) => ({
      episode_id: entry.ep.id,
      label: `${language} ${quality}`,
      language,
      quality,
      source_url: entry.url,
      source_type: sourceTypeFromUrl(entry.url),
      is_default: idx === 0,
      is_active: true,
      created_by: adminId,
    }))

  if (rows.length === 0) throw new Error('Aucune source générée.')

  const { error: insertError } = await supabase.from('episode_sources').insert(rows)
  if (insertError) throw insertError

  return rows.length
}

export async function sendGlobalNotification(title: string, message: string, adminId: string): Promise<void> {
  const { data: profiles } = await supabase.from('profiles').select('id')
  if (!profiles?.length) return

  const rows = profiles.map((p) => ({
    user_id: p.id,
    title,
    message,
    type: 'global',
    created_by: adminId,
    read: false,
  }))

  const { error } = await supabase.from('notifications').insert(rows)
  if (error) throw error
}

import { supabase } from '@/services/supabaseClient'

export type ChatMessage = {
  id: string
  anime_id: string
  episode_id: string | null
  user_id: string
  username: string
  message: string
  created_at: string
}

export async function fetchMessages(animeId: string, limit = 80): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('watch_chat_messages')
    .select('id,anime_id,episode_id,user_id,username,message,created_at')
    .eq('anime_id', animeId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) return []
  return data ?? []
}

export async function sendMessage(params: {
  animeId: string
  episodeId: string | null
  message: string
}): Promise<ChatMessage | null> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) throw new Error('Non connecté.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single()

  const username = profile?.username ?? 'Anonyme'

  const { data, error } = await supabase
    .from('watch_chat_messages')
    .insert({
      anime_id: params.animeId,
      episode_id: params.episodeId,
      user_id: userId,
      username,
      message: params.message.trim().slice(0, 300),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ChatMessage
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase
    .from('watch_chat_messages')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

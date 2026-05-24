import { supabase } from '@/services/supabaseClient'

export type NotificationRow = {
  id: string
  title: string
  message: string
  reason: string | null
  read: boolean
  type: string
  target_type: string
  created_at: string
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function fetchNotifications(): Promise<NotificationRow[]> {
  const userId = await getUserId()
  if (!userId) return []

  // Récupère les notifs personnelles ET globales
  const { data, error } = await supabase
    .from('notifications')
    .select('id,title,message,reason,read,type,target_type,created_at')
    .or(`user_id.eq.${userId},target_type.eq.global`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    // Fallback : tenter sans le filtre target_type (colonne peut-être absente)
    const { data: fallback, error: fallbackErr } = await supabase
      .from('notifications')
      .select('id,title,message,reason,read,type,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (fallbackErr) {
      console.warn('[notifications] fetch error:', fallbackErr.message)
      return []
    }
    return (fallback ?? []).map((n) => ({ ...n, target_type: 'user', reason: n.reason ?? null }))
  }

  return (data ?? []).map((n) => ({
    ...n,
    target_type: n.target_type ?? 'user',
    reason: n.reason ?? null,
  }))
}

export async function fetchUnreadCount(): Promise<number> {
  const userId = await getUserId()
  if (!userId) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) return 0
  return count ?? 0
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
}

export async function sendGlobalNotification(params: {
  title: string
  message: string
  type: string
  adminId: string
}): Promise<void> {
  // Récupérer tous les user IDs
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')

  if (!profiles?.length) return

  const rows = profiles.map((p) => ({
    user_id: p.id,
    title: params.title,
    message: params.message,
    type: params.type,
    target_type: 'global',
    created_by: params.adminId,
    read: false,
  }))

  // Insérer par batch de 100
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from('notifications').insert(rows.slice(i, i + 100))
    if (error) throw new Error(error.message)
  }
}

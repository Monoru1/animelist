import { supabase } from '@/services/supabaseClient'

export type NotificationRow = {
  id: string
  title: string
  message: string
  reason: string | null
  read: boolean
  type: string
  created_at: string
}

export async function fetchNotifications(): Promise<NotificationRow[]> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('id,title,message,reason,read,type,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchUnreadCount(): Promise<number> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return 0

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  return count ?? 0
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}

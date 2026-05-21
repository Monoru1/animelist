import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type NotificationRow = {
  id: string
  title: string
  message: string
  reason: string | null
  read: boolean
  created_at: string
}

async function fetchNotifications(): Promise<NotificationRow[]> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id

  if (!userId) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('id,title,message,reason,read,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  return (
    <main>
      <h1>Notifications</h1>
      <p>Messages envoyés par l’administration.</p>

      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p>Impossible de charger les notifications.</p> : null}
      {!isLoading && notifications.length === 0 ? <p>Aucune notification pour le moment.</p> : null}

      <div style={{ display: 'grid', gap: 12 }}>
        {notifications.map((notification) => (
          <article key={notification.id} style={{ border: '1px solid var(--color-border)', borderRadius: 16, padding: 16, background: notification.read ? 'var(--color-surface)' : 'var(--color-surface-hi)' }}>
            <h2>{notification.title}</h2>
            <p>{notification.message}</p>
            {notification.reason ? <p>Raison : {notification.reason}</p> : null}
            <small>{new Date(notification.created_at).toLocaleString()}</small>
            {!notification.read ? <button type="button" onClick={() => void markAsRead(notification.id)}>Marquer comme lu</button> : null}
          </article>
        ))}
      </div>
    </main>
  )
}

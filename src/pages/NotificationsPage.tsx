import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { useNotifications, useMarkRead, useMarkAllRead } from '@/features/notifications/hooks/useNotifications'

const DEFAULT_TYPE = { label: 'Notification', color: '#9999a8' }

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  moderation: { label: 'Modération', color: '#ef4444' },
  global: { label: 'Annonce', color: '#7c5cff' },
  info: { label: 'Info', color: '#3b82f6' },
}

function getTypeMeta(type: string): { label: string; color: string } {
  return TYPE_LABELS[type] ?? DEFAULT_TYPE
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

export function NotificationsPage() {
  const { data: notifications = [], isLoading, error } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <main className="notif-page">
      {/* Header */}
      <div className="surface-panel notif-header">
        <div className="notif-header-left">
          <p className="eyebrow" style={{ margin: 0 }}>INBOX</p>
          <h1>Notifications</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            Messages envoyés par l'administration et la modération.
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            className="secondary-btn"
            type="button"
            onClick={() => void markAllRead.mutateAsync(undefined)}
            disabled={markAllRead.isPending}
          >
            <CheckCheck size={16} />
            {markAllRead.isPending ? 'En cours…' : `Tout marquer lu (${unreadCount})`}
          </button>
        ) : null}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="notif-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="notif-item notif-item--skeleton" aria-hidden="true">
              <div className="skeleton-line" style={{ width: '40%', height: 14 }} />
              <div className="skeleton-line" style={{ width: '80%', height: 12, marginTop: 8 }} />
              <div className="skeleton-line" style={{ width: '60%', height: 12, marginTop: 6 }} />
            </div>
          ))}
        </div>
      ) : null}

      {/* Error */}
      {error ? (
        <div className="surface-panel empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h2>Impossible de charger les notifications</h2>
        </div>
      ) : null}

      {/* Empty */}
      {!isLoading && !error && notifications.length === 0 ? (
        <div className="surface-panel empty-state">
          <div className="empty-state-icon"><BellOff size={42} /></div>
          <h2>Aucune notification</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Tu es à jour. Les messages de modération et les annonces apparaîtront ici.
          </p>
        </div>
      ) : null}

      {/* List */}
      {!isLoading && !error && notifications.length > 0 ? (
        <div className="notif-list">
          {notifications.map((notif) => {
            const meta = getTypeMeta(notif.type)
            return (
              <article
                key={notif.id}
                className={`notif-item${notif.read ? '' : ' notif-item--unread'}`}
              >
                <div className="notif-item-head">
                  <span className="notif-type-badge" style={{ background: `${meta.color}22`, color: meta.color }}>
                    {meta.label}
                  </span>
                  <span className="notif-time">{timeAgo(notif.created_at)}</span>
                  {!notif.read ? <span className="notif-unread-dot" aria-label="Non lu" /> : null}
                </div>
                <h3 className="notif-title">{notif.title}</h3>
                <p className="notif-message">{notif.message}</p>
                {notif.reason ? (
                  <p className="notif-reason">Raison : {notif.reason}</p>
                ) : null}
                {!notif.read ? (
                  <button
                    className="secondary-btn notif-read-btn"
                    type="button"
                    onClick={() => void markRead.mutateAsync(notif.id)}
                    disabled={markRead.isPending}
                  >
                    <Bell size={14} />
                    Marquer comme lu
                  </button>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : null}
    </main>
  )
}

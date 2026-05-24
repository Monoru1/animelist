import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { useWatchHistory } from '@/features/watch/hooks/useWatchHistory'
import { getHistoryAnime } from '@/features/watch/api/watchHistory'
import { ROUTES } from '@/app/routes'

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

export function WatchHistoryPage() {
  const { data: history = [], isLoading, error } = useWatchHistory()

  return (
    <main>
      <div className="surface-panel" style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ margin: 0 }}>REPRISE</p>
        <h1>Continuer à regarder</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Retrouve les animés que tu as ouverts récemment.
        </p>
      </div>

      {isLoading ? (
        <div className="card-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="anime-card" style={{ minHeight: 300, opacity: .55, background: 'rgba(255,255,255,.04)' }} aria-hidden="true" />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="surface-panel empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h2>Impossible de charger l'historique</h2>
        </div>
      ) : null}

      {!isLoading && !error && history.length === 0 ? (
        <div className="surface-panel empty-state">
          <div className="empty-state-icon"><Clock size={42} /></div>
          <h2>Aucun historique</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Lance un anime depuis la bibliothèque pour commencer ton historique.
          </p>
          <Link className="primary-btn" to={ROUTES.LIBRARY} style={{ justifySelf: 'center' }}>
            Explorer la bibliothèque
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && history.length > 0 ? (
        <div className="card-grid">
          {history.map((item) => {
            const anime = getHistoryAnime(item.animes)
            if (!anime) return null
            return (
              <article key={item.id} className="anime-card">
                <Link to={ROUTES.ANIME_DETAIL(anime.id)}>
                  <img src={anime.poster_url} alt={anime.title} loading="lazy" />
                </Link>
                <div style={{ padding: 16, display: 'grid', gap: 8 }}>
                  <h2 style={{ fontSize: 18, margin: 0 }}>{anime.title}</h2>
                  {anime.genre ? <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 13 }}>{anime.genre}</p> : null}
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} />
                    {timeAgo(item.last_watched_at)}
                  </p>
                  <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
                    <Link className="primary-btn" to={ROUTES.WATCH(anime.id)}>▶ Reprendre</Link>
                    <Link className="secondary-btn" to={ROUTES.ANIME_DETAIL(anime.id)}>Voir la fiche</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </main>
  )
}

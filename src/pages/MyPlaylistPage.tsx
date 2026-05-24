import { Link } from 'react-router-dom'
import { ListVideo } from 'lucide-react'
import { useMyAnimes, useDeleteAnime } from '@/features/library/hooks/useAnimes'
import { ROUTES } from '@/app/routes'

export function MyPlaylistPage() {
  const { data: animes = [], isLoading, error } = useMyAnimes()
  const deleteAnime = useDeleteAnime()

  async function handleDelete(id: string, title: string) {
    const confirmed = window.confirm(`Supprimer « ${title} » de ta playlist publique ?`)
    if (!confirmed) return
    await deleteAnime.mutateAsync(id)
  }

  return (
    <main>
      <div className="surface-panel" style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ margin: 0 }}>MON ESPACE</p>
        <h1>Ma playlist publique</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Gère les animés que tu as ajoutés à la bibliothèque communautaire.
        </p>
      </div>

      {isLoading ? (
        <div className="card-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="anime-card" style={{ minHeight: 300, opacity: .5, background: 'rgba(255,255,255,.04)' }} aria-hidden="true" />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="surface-panel empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h2>Impossible de charger ta playlist</h2>
        </div>
      ) : null}

      {!isLoading && !error && animes.length === 0 ? (
        <div className="surface-panel empty-state">
          <div className="empty-state-icon"><ListVideo size={42} /></div>
          <h2>Ta playlist est vide</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Ajoute ton premier animé pour le partager avec la communauté.
          </p>
          <Link className="primary-btn" to={ROUTES.ADD} style={{ justifySelf: 'center' }}>
            Ajouter un anime
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && animes.length > 0 ? (
        <div className="card-grid">
          {animes.map((anime) => (
            <article key={anime.id} className="anime-card">
              <Link to={ROUTES.ANIME_DETAIL(anime.id)}>
                <img src={anime.poster_url} alt={anime.title} loading="lazy" />
              </Link>
              <div style={{ padding: 16, display: 'grid', gap: 8 }}>
                <h2 style={{ fontSize: 18, margin: 0 }}>{anime.title}</h2>
                {anime.genre ? <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 13 }}>{anime.genre}</p> : null}
                <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
                  <Link className="primary-btn" to={ROUTES.WATCH(anime.id)}>▶ Regarder</Link>
                  <Link className="secondary-btn" to={ROUTES.ANIME_DETAIL(anime.id)}>Voir la fiche</Link>
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => void handleDelete(anime.id, anime.title)}
                    disabled={deleteAnime.isPending}
                    style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,.3)' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </main>
  )
}

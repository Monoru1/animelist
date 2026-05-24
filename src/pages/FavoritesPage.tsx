import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useFavorites, useToggleFavorite, getFavoriteAnime } from '@/hooks/useFavorites'
import { ROUTES } from '@/app/routes'

function FavoriteCard({ row }: { row: import('@/services/favorites').FavoriteRow }) {
  const anime = getFavoriteAnime(row)
  const toggle = useToggleFavorite(row.anime_id)

  if (!anime) return null

  return (
    <article className="anime-card">
      <Link to={ROUTES.ANIME_DETAIL(anime.id)}>
        <img src={anime.poster_url} alt={anime.title} loading="lazy" />
      </Link>
      <div style={{ padding: 14, display: 'grid', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{anime.title}</h3>
        {anime.genre ? <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 13 }}>{anime.genre}</p> : null}
        <div style={{ display: 'grid', gap: 7 }}>
          <Link className="primary-btn" to={ROUTES.WATCH(anime.id)}>▶ Regarder</Link>
          <Link className="secondary-btn" to={ROUTES.ANIME_DETAIL(anime.id)}>Voir la fiche</Link>
          <button
            className="secondary-btn"
            type="button"
            onClick={() => void toggle.mutateAsync(false)}
            disabled={toggle.isPending}
            style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,.25)' }}
          >
            {toggle.isPending ? '…' : '♥ Retirer des favoris'}
          </button>
        </div>
      </div>
    </article>
  )
}

export function FavoritesPage() {
  const { data: favorites, isLoading, isError, refetch } = useFavorites()

  const validFavorites = (favorites ?? []).filter((row) => getFavoriteAnime(row) !== null)

  return (
    <main>
      <section className="surface-panel" style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ margin: 0 }}>COLLECTION</p>
        <h1 style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)', lineHeight: .95, margin: '10px 0' }}>
          Mes favoris
        </h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Tous les animés que tu as sauvegardés.
          {!isLoading && validFavorites.length > 0 ? ` (${validFavorites.length})` : ''}
        </p>
      </section>

      {/* Loading */}
      {isLoading ? (
        <div className="card-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="anime-card" style={{ minHeight: 320, opacity: .4, background: 'rgba(255,255,255,.04)' }} aria-hidden="true" />
          ))}
        </div>
      ) : null}

      {/* Erreur réseau */}
      {isError ? (
        <div className="surface-panel empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h2>Impossible de charger les favoris</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Vérifie ta connexion ou réessaie dans quelques secondes.
          </p>
          <button className="primary-btn" type="button" onClick={() => void refetch()} style={{ justifySelf: 'center' }}>
            Réessayer
          </button>
        </div>
      ) : null}

      {/* Vide */}
      {!isLoading && !isError && validFavorites.length === 0 ? (
        <div className="surface-panel empty-state">
          <div className="empty-state-icon"><Heart size={40} /></div>
          <h2>Aucun favori pour le moment</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Ajoute des animés depuis la bibliothèque pour les retrouver ici.
          </p>
          <Link className="primary-btn" to={ROUTES.LIBRARY} style={{ justifySelf: 'center' }}>
            Explorer la bibliothèque
          </Link>
        </div>
      ) : null}

      {/* Liste */}
      {!isLoading && !isError && validFavorites.length > 0 ? (
        <div className="card-grid">
          {validFavorites.map((row) => (
            <FavoriteCard key={row.id} row={row} />
          ))}
        </div>
      ) : null}
    </main>
  )
}

import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { CommunityAnimeCard } from '@/components/anime/AnimeSpotlightCard'
import { getFavoriteAnime, useFavorites } from '@/hooks/useFavorites'

export function FavoritesPage() {
  const { data: favorites = [], isLoading, isError, refetch } = useFavorites()

  return (
    <main>
      <section className="surface-panel" style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ margin: 0 }}>COLLECTION</p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: .95, margin: '12px 0' }}>Mes favoris</h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 780, lineHeight: 1.7 }}>
          Retrouve tous les animés que tu as sauvegardés pour continuer ton aventure Anime OS.
        </p>
      </section>

      {isLoading ? (
        <section className="card-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="anime-card" style={{ minHeight: 360, opacity: .55, background: 'linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))' }} />
          ))}
        </section>
      ) : null}

      {isError ? (
        <section className="surface-panel" style={{ textAlign: 'center', display: 'grid', gap: 18 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div>
            <h2 style={{ marginTop: 0 }}>Impossible de charger les favoris</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Une désynchronisation temporaire est survenue. Réessaie maintenant.
            </p>
          </div>
          <button className="primary-btn" type="button" onClick={() => void refetch()}>
            Réessayer
          </button>
        </section>
      ) : null}

      {!isLoading && !isError && favorites.length === 0 ? (
        <section className="surface-panel" style={{ textAlign: 'center', display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', placeItems: 'center', width: 90, height: 90, borderRadius: '50%', margin: '0 auto', background: 'rgba(124,92,255,.18)' }}>
            <Heart size={38} />
          </div>
          <div>
            <h2 style={{ marginTop: 0 }}>Aucun favori pour le moment</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 620, margin: '0 auto' }}>
              Commence à sauvegarder des animés depuis la bibliothèque pour créer ta collection personnalisée.
            </p>
          </div>
          <Link className="primary-btn" to="/library" style={{ justifySelf: 'center' }}>
            Explorer la bibliothèque
          </Link>
        </section>
      ) : null}

      {!isLoading && !isError && favorites.length > 0 ? (
        <section className="card-grid">
          {favorites.map((favorite) => {
            const anime = getFavoriteAnime(favorite.animes)
            if (!anime) return null

            return (
              <CommunityAnimeCard
                key={favorite.id}
                anime={{
                  id: anime.id,
                  title: anime.title,
                  genre: anime.genre,
                  poster_url: anime.poster_url,
                  watch_url: anime.watch_url,
                }}
              />
            )
          })}
        </section>
      ) : null}
    </main>
  )
}

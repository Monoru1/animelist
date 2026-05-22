import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type FavoriteAnime = {
  id: string
  title: string
  poster_url: string
  genre: string | null
  watch_url: string
}

type FavoriteRow = {
  id: string
  created_at: string
  animes?: FavoriteAnime | FavoriteAnime[] | null
}

function getFavoriteAnime(animes: FavoriteRow['animes']) {
  return Array.isArray(animes) ? animes[0] : animes
}

async function fetchFavorites(): Promise<FavoriteRow[]> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('favorites')
    .select('id,created_at,animes(id,title,poster_url,genre,watch_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as FavoriteRow[]
}

export function FavoritesPage() {
  const { data: favorites = [], isLoading, error } = useQuery({ queryKey: ['favorites'], queryFn: fetchFavorites })

  return (
    <main>
      <div className="surface-panel" style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>COLLECTION</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 1, margin: '12px 0' }}>Mes favoris</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>Tous les animés que tu as ajoutés en favoris.</p>
      </div>

      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p>Impossible de charger les favoris.</p> : null}
      {!isLoading && favorites.length === 0 ? <p>Aucun favori pour le moment.</p> : null}

      <div className="card-grid">
        {favorites.map((item) => {
          const anime = getFavoriteAnime(item.animes)
          if (!anime) return null

          return (
            <article key={item.id} className="anime-card">
              <Link to={`/anime/${anime.id}`} style={{ textDecoration: 'none' }}>
                <img src={anime.poster_url} alt={anime.title} />
              </Link>
              <div style={{ padding: 16 }}>
                <h2 style={{ fontSize: 20, marginTop: 0 }}>{anime.title}</h2>
                {anime.genre ? <p style={{ color: 'var(--color-text-muted)' }}>{anime.genre}</p> : null}
                <Link className="primary-btn" to={`/anime/${anime.id}`} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Voir la fiche</Link>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}

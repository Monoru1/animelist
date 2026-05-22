import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type HistoryAnime = {
  id: string
  title: string
  poster_url: string
  genre: string | null
  watch_url: string
}

type HistoryRow = {
  id: string
  last_watched_at: string
  animes?: HistoryAnime | HistoryAnime[] | null
}

function getHistoryAnime(animes: HistoryRow['animes']) {
  return Array.isArray(animes) ? animes[0] : animes
}

async function fetchHistory(): Promise<HistoryRow[]> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('watch_history')
    .select('id,last_watched_at,animes(id,title,poster_url,genre,watch_url)')
    .eq('user_id', userId)
    .order('last_watched_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as HistoryRow[]
}

export function WatchHistoryPage() {
  const { data: history = [], isLoading, error } = useQuery({ queryKey: ['watch-history'], queryFn: fetchHistory })

  return (
    <main>
      <div className="surface-panel" style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>REPRISE</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 1, margin: '12px 0' }}>Continuer à regarder</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>Retrouve les animés que tu as ouverts récemment.</p>
      </div>

      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p>Impossible de charger l’historique.</p> : null}
      {!isLoading && history.length === 0 ? <p>Aucun historique pour le moment.</p> : null}

      <div className="card-grid">
        {history.map((item) => {
          const anime = getHistoryAnime(item.animes)
          if (!anime) return null

          return (
            <article key={item.id} className="anime-card">
              <Link to={`/anime/${anime.id}`} style={{ textDecoration: 'none' }}>
                <img src={anime.poster_url} alt={anime.title} />
              </Link>
              <div style={{ padding: 16 }}>
                <h2 style={{ fontSize: 20, marginTop: 0 }}>{anime.title}</h2>
                {anime.genre ? <p style={{ color: 'var(--color-text-muted)' }}>{anime.genre}</p> : null}
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Dernier visionnage : {new Date(item.last_watched_at).toLocaleString()}</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  <Link className="secondary-btn" to={`/anime/${anime.id}`} style={{ textAlign: 'center', textDecoration: 'none' }}>Voir la fiche</Link>
                  <a className="primary-btn" href={anime.watch_url} target="_blank" rel="noreferrer" style={{ textAlign: 'center', textDecoration: 'none' }}>Reprendre</a>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}

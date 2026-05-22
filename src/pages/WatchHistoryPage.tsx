import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type HistoryRow = {
  id: string
  last_watched_at: string
  animes?: {
    id: string
    title: string
    poster_url: string
    genre: string | null
    watch_url: string
  } | null
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
  return (data ?? []) as HistoryRow[]
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
        {history.map((item) => item.animes ? (
          <article key={item.id} className="anime-card">
            <Link to={`/anime/${item.animes.id}`} style={{ textDecoration: 'none' }}>
              <img src={item.animes.poster_url} alt={item.animes.title} />
            </Link>
            <div style={{ padding: 16 }}>
              <h2 style={{ fontSize: 20, marginTop: 0 }}>{item.animes.title}</h2>
              {item.animes.genre ? <p style={{ color: 'var(--color-text-muted)' }}>{item.animes.genre}</p> : null}
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Dernier visionnage : {new Date(item.last_watched_at).toLocaleString()}</p>
              <a className="primary-btn" href={item.animes.watch_url} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Reprendre</a>
            </div>
          </article>
        ) : null)}
      </div>
    </main>
  )
}

import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type AnimeRow = {
  id: string
  title: string
  poster_url: string
  watch_url: string
  genre: string | null
  created_at: string
}

async function fetchMyAnimes(): Promise<AnimeRow[]> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id

  if (!userId) return []

  const { data, error } = await supabase
    .from('animes')
    .select('id,title,poster_url,watch_url,genre,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function MyPlaylistPage() {
  const queryClient = useQueryClient()
  const { data: animes = [], isLoading, error } = useQuery({ queryKey: ['my-animes'], queryFn: fetchMyAnimes })

  async function deleteAnime(id: string) {
    const confirmed = window.confirm('Supprimer cet animé de ta playlist publique ?')
    if (!confirmed) return

    const { error: deleteError } = await supabase.from('animes').delete().eq('id', id)

    if (deleteError) {
      alert(deleteError.message)
      return
    }

    await queryClient.invalidateQueries({ queryKey: ['my-animes'] })
    await queryClient.invalidateQueries({ queryKey: ['public-animes'] })
  }

  return (
    <main>
      <div className="surface-panel" style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>MON ESPACE</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 1, margin: '12px 0' }}>Ma playlist publique</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>Gère les animés que tu as ajoutés à la bibliothèque communautaire.</p>
      </div>

      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p>Impossible de charger ta playlist.</p> : null}
      {!isLoading && animes.length === 0 ? (
        <div className="surface-panel">
          <h2>Ta playlist est vide.</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Ajoute ton premier animé pour le partager avec la communauté.</p>
          <Link className="primary-btn" to="/add" style={{ display: 'inline-block', textDecoration: 'none' }}>Ajouter un animé</Link>
        </div>
      ) : null}

      <div className="card-grid">
        {animes.map((anime) => (
          <article key={anime.id} className="anime-card">
            <Link to={`/anime/${anime.id}`} style={{ textDecoration: 'none' }}>
              <img src={anime.poster_url} alt={anime.title} />
            </Link>
            <div style={{ padding: 16 }}>
              <h2 style={{ fontSize: 20, marginTop: 0 }}>{anime.title}</h2>
              {anime.genre ? <p style={{ color: 'var(--color-text-muted)' }}>{anime.genre}</p> : null}
              <div style={{ display: 'grid', gap: 10 }}>
                <Link className="primary-btn" to={`/anime/${anime.id}`} style={{ textAlign: 'center', textDecoration: 'none' }}>Voir la fiche</Link>
                <a className="secondary-btn" href={anime.watch_url} target="_blank" rel="noreferrer" style={{ textAlign: 'center', textDecoration: 'none' }}>Regarder</a>
                <button className="secondary-btn" type="button" onClick={() => void deleteAnime(anime.id)}>Supprimer</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

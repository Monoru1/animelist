import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type AuthorProfile = { username: string | null; avatar_url: string | null }

type LibraryAnime = {
  id: string
  user_id: string
  title: string
  description: string | null
  genre: string | null
  poster_url: string
  watch_url: string
  created_at: string
  profiles?: AuthorProfile | AuthorProfile[] | null
}

function getAuthorName(profiles: LibraryAnime['profiles']) {
  const profile = Array.isArray(profiles) ? profiles[0] : profiles
  return profile?.username ?? 'Utilisateur'
}

async function fetchAnimes(): Promise<LibraryAnime[]> {
  const { data, error } = await supabase
    .from('animes')
    .select('id,user_id,title,description,genre,poster_url,watch_url,created_at,profiles(username,avatar_url)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as LibraryAnime[]
}

export function LibraryPage() {
  const [search, setSearch] = useState('')
  const { data: animes = [], isLoading, error } = useQuery({ queryKey: ['public-animes'], queryFn: fetchAnimes })

  const filteredAnimes = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return animes
    return animes.filter((anime) => anime.title.toLowerCase().includes(value) || (anime.genre ?? '').toLowerCase().includes(value))
  }, [animes, search])

  return (
    <section>
      <div className="surface-panel" style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>COMMUNAUTÉ ANIME</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 1, margin: '12px 0' }}>Bibliothèque publique</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>Les animés ajoutés par la communauté apparaissent ici automatiquement.</p>
        <input className="input-field" placeholder="Rechercher un animé ou un genre..." value={search} onChange={(event) => setSearch(event.target.value)} style={{ maxWidth: 460, marginTop: 18 }} />
      </div>

      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p>Impossible de charger la bibliothèque.</p> : null}
      {!isLoading && filteredAnimes.length === 0 ? <p>Aucun animé trouvé.</p> : null}

      <div className="card-grid">
        {filteredAnimes.map((anime) => (
          <article key={anime.id} className="anime-card">
            <img src={anime.poster_url} alt={anime.title} />
            <div style={{ padding: 16 }}>
              <p style={{ margin: '0 0 8px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                Ajouté par : <strong style={{ color: 'var(--color-text)' }}>{getAuthorName(anime.profiles)}</strong>
              </p>
              <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>{anime.title}</h2>
              {anime.genre ? <p style={{ color: 'var(--color-text-muted)', minHeight: 44 }}>{anime.genre}</p> : null}
              <a className="primary-btn" href={anime.watch_url} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 14 }}>
                Regarder
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

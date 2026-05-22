import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

  const featuredAnime = filteredAnimes[0]
  const recentAnimes = filteredAnimes.slice(0, 12)
  const popularAnimes = [...filteredAnimes].sort((a, b) => a.title.localeCompare(b.title)).slice(0, 12)

  return (
    <section>
      <div
        className="surface-panel"
        style={{
          marginBottom: 28,
          minHeight: 380,
          display: 'grid',
          alignContent: 'end',
          backgroundImage: featuredAnime ? `linear-gradient(90deg, rgba(10,10,11,.96), rgba(10,10,11,.62)), url(${featuredAnime.poster_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>COMMUNAUTÉ ANIME</p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 5.8rem)', lineHeight: 1, margin: '12px 0' }}>
          {featuredAnime ? featuredAnime.title : 'Bibliothèque publique'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 18, maxWidth: 780 }}>
          {featuredAnime?.description ?? 'Les animés ajoutés par la communauté apparaissent ici automatiquement.'}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
          {featuredAnime ? <Link className="primary-btn" to={`/anime/${featuredAnime.id}`} style={{ textDecoration: 'none' }}>Découvrir</Link> : null}
          <input className="input-field" placeholder="Rechercher un animé ou un genre..." value={search} onChange={(event) => setSearch(event.target.value)} style={{ maxWidth: 460 }} />
        </div>
      </div>

      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p>Impossible de charger la bibliothèque.</p> : null}
      {!isLoading && filteredAnimes.length === 0 ? <p>Aucun animé trouvé.</p> : null}

      <h2>Ajouts récents</h2>
      <div className="card-grid" style={{ marginBottom: 34 }}>
        {recentAnimes.map((anime) => (
          <article key={anime.id} className="anime-card">
            <Link to={`/anime/${anime.id}`} style={{ textDecoration: 'none' }}>
              <img src={anime.poster_url} alt={anime.title} />
            </Link>
            <div style={{ padding: 16 }}>
              <p style={{ margin: '0 0 8px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                Ajouté par : <strong style={{ color: 'var(--color-text)' }}>{getAuthorName(anime.profiles)}</strong>
              </p>
              <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>{anime.title}</h2>
              {anime.genre ? <p style={{ color: 'var(--color-text-muted)', minHeight: 44 }}>{anime.genre}</p> : null}
              <div style={{ display: 'grid', gap: 10 }}>
                <Link className="primary-btn" to={`/anime/${anime.id}`} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Voir la fiche</Link>
                <a className="secondary-btn" href={anime.watch_url} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Regarder</a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <h2>Populaires communauté</h2>
      <div className="card-grid">
        {popularAnimes.map((anime) => (
          <article key={anime.id} className="anime-card">
            <Link to={`/anime/${anime.id}`} style={{ textDecoration: 'none' }}>
              <img src={anime.poster_url} alt={anime.title} />
            </Link>
            <div style={{ padding: 16 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>{anime.title}</h2>
              {anime.genre ? <p style={{ color: 'var(--color-text-muted)', minHeight: 44 }}>{anime.genre}</p> : null}
              <Link className="primary-btn" to={`/anime/${anime.id}`} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 14 }}>Découvrir</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

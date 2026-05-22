import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

type AnimeDetail = {
  id: string
  user_id: string
  title: string
  description: string | null
  genre: string | null
  poster_url: string
  watch_url: string
  created_at: string
  profiles?: { username: string | null; avatar_url: string | null }[] | { username: string | null; avatar_url: string | null } | null
}

function getAuthorName(profiles: AnimeDetail['profiles']) {
  const profile = Array.isArray(profiles) ? profiles[0] : profiles
  return profile?.username ?? 'Utilisateur'
}

export function AnimeDetailPage() {
  const { animeId } = useParams()
  const [anime, setAnime] = useState<AnimeDetail | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadAnime() {
      if (!animeId) return

      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id

      const { data } = await supabase
        .from('animes')
        .select('id,user_id,title,description,genre,poster_url,watch_url,created_at,profiles(username,avatar_url)')
        .eq('id', animeId)
        .single()

      setAnime((data ?? null) as AnimeDetail | null)

      const { count } = await supabase
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('anime_id', animeId)

      setFavoriteCount(count ?? 0)

      if (userId) {
        const { data: favorite } = await supabase
          .from('favorites')
          .select('id')
          .eq('anime_id', animeId)
          .eq('user_id', userId)
          .maybeSingle()

        setIsFavorite(Boolean(favorite))
      }
    }

    void loadAnime()
  }, [animeId])

  async function toggleFavorite() {
    if (!animeId) return
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return

    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('anime_id', animeId)
      setIsFavorite(false)
      setFavoriteCount((value) => Math.max(0, value - 1))
      return
    }

    await supabase.from('favorites').insert({ user_id: userId, anime_id: animeId })
    setIsFavorite(true)
    setFavoriteCount((value) => value + 1)
  }

  async function markWatching() {
    if (!animeId) return
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return

    await supabase.from('watch_history').upsert({
      user_id: userId,
      anime_id: animeId,
      progress_seconds: 0,
      last_watched_at: new Date().toISOString(),
    }, { onConflict: 'user_id,anime_id' })

    setMessage('Ajouté à Continuer à regarder.')
  }

  if (!anime) return <p>Chargement...</p>

  return (
    <section>
      <div
        className="surface-panel"
        style={{
          minHeight: 520,
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 280px) 1fr',
          gap: 28,
          alignItems: 'end',
          backgroundImage: `linear-gradient(90deg, rgba(10,10,11,.96), rgba(10,10,11,.7)), url(${anime.poster_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
        }}
      >
        <img src={anime.poster_url} alt={anime.title} style={{ width: '100%', borderRadius: 24, boxShadow: '0 30px 80px rgba(0,0,0,.45)' }} />
        <div>
          <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900 }}>AJOUTÉ PAR {getAuthorName(anime.profiles).toUpperCase()}</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)', lineHeight: 1, margin: '10px 0' }}>{anime.title}</h1>
          {anime.genre ? <p style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>{anime.genre}</p> : null}
          {anime.description ? <p style={{ maxWidth: 860, lineHeight: 1.7, color: 'var(--color-text-muted)', fontSize: 17 }}>{anime.description}</p> : null}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
            <a className="primary-btn" href={anime.watch_url} target="_blank" rel="noreferrer" onClick={() => void markWatching()} style={{ textDecoration: 'none' }}>
              Regarder maintenant
            </a>
            <button className="secondary-btn" type="button" onClick={() => void toggleFavorite()}>
              {isFavorite ? '❤️ Favori' : '🤍 Ajouter aux favoris'} · {favoriteCount}
            </button>
            <Link className="secondary-btn" to="/library" style={{ textDecoration: 'none' }}>Retour</Link>
          </div>
          {message ? <p>{message}</p> : null}
        </div>
      </div>
    </section>
  )
}

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

function detectBadges(url: string) {
  const value = url.toLowerCase()
  const badges = ['HD']
  if (value.includes('vostfr')) badges.push('VOSTFR')
  if (value.includes('vf')) badges.push('VF')
  if (value.includes('anime-sama')) badges.push('Anime-Sama')
  if (value.includes('neko')) badges.push('Neko')
  return badges
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

      setAnime((data ?? null) as unknown as AnimeDetail | null)

      const { count } = await supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('anime_id', animeId)
      setFavoriteCount(count ?? 0)

      if (userId) {
        const { data: favorite } = await supabase.from('favorites').select('id').eq('anime_id', animeId).eq('user_id', userId).maybeSingle()
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
    <section className="anime-detail-page">
      <div className="anime-detail-backdrop" style={{ backgroundImage: `url(${anime.poster_url})` }} />

      <div className="surface-panel anime-detail-card">
        <div className="anime-detail-poster-wrap">
          <img className="anime-detail-poster" src={anime.poster_url} alt={anime.title} />
        </div>

        <div className="anime-detail-content">
          <p className="eyebrow">AJOUTÉ PAR {getAuthorName(anime.profiles).toUpperCase()}</p>
          <h1>{anime.title}</h1>

          <div className="badge-row">
            {detectBadges(anime.watch_url).map((badge) => <span key={badge} className="anime-badge">{badge}</span>)}
          </div>

          {anime.genre ? <p className="anime-detail-genre">{anime.genre}</p> : null}
          {anime.description ? <p className="anime-detail-description">{anime.description}</p> : null}

          <div className="anime-detail-actions">
            <a className="primary-btn" href={anime.watch_url} target="_blank" rel="noreferrer" onClick={() => void markWatching()}>Regarder maintenant</a>
            <button className="secondary-btn" type="button" onClick={() => void toggleFavorite()}>{isFavorite ? '❤️ Favori' : '🤍 Ajouter aux favoris'} · {favoriteCount}</button>
            <Link className="secondary-btn" to="/library">Retour</Link>
          </div>

          {message ? <p className="anime-detail-message">{message}</p> : null}
        </div>
      </div>
    </section>
  )
}

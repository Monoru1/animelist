import { useEffect, useMemo, useState } from 'react'
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
  if (value.includes('anime-sama')) badges.push('VF/VOSTFR')
  if (value.includes('neko')) badges.push('Neko')
  return Array.from(new Set(badges))
}

function enrichSynopsis(title: string, description: string | null) {
  const clean = (description ?? '').trim()
  if (clean.length > 130) return clean
  if (clean.length > 0) return `${clean} Découvre l’histoire, les combats, les enjeux et l’univers de ${title} dans une expérience de lecture immersive pensée pour reprendre rapidement ton visionnage.`
  return `${title} t’embarque dans une aventure anime intense, rythmée par ses personnages, ses enjeux et son univers. Lance la lecture, ajoute-le à tes favoris ou garde-le dans ta playlist pour reprendre plus tard.`
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

  const synopsis = useMemo(() => anime ? enrichSynopsis(anime.title, anime.description) : '', [anime])

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

  if (!anime) return <p>Chargement...</p>

  return (
    <section className="anime-detail-page">
      <div className="anime-detail-backdrop" style={{ backgroundImage: `url(${anime.poster_url})` }} />

      <div className="surface-panel anime-detail-card">
        <div className="anime-detail-poster-wrap">
          <img className="anime-detail-poster" src={anime.poster_url} alt={anime.title} />
        </div>

        <div className="anime-detail-content">
          <p className="eyebrow">ANIMELIST ORIGINAL · AJOUTÉ PAR {getAuthorName(anime.profiles).toUpperCase()}</p>
          <h1>{anime.title}</h1>

          <div className="badge-row">
            {detectBadges(anime.watch_url).map((badge) => <span key={badge} className="anime-badge">{badge}</span>)}
            <span className="anime-badge">Lecture intégrée</span>
          </div>

          {anime.genre ? <p className="anime-detail-genre">{anime.genre}</p> : null}
          <p className="anime-detail-description">{synopsis}</p>

          <div className="anime-detail-actions">
            <Link className="primary-btn" to={`/watch/${anime.id}`}>▶ Regarder maintenant</Link>
            <button className="secondary-btn" type="button" onClick={() => void toggleFavorite()}>{isFavorite ? '❤️ Favori' : '🤍 Ajouter aux favoris'} · {favoriteCount}</button>
            <Link className="secondary-btn" to="/library">Retour</Link>
          </div>

          {message ? <p className="anime-detail-message">{message}</p> : null}
        </div>
      </div>
    </section>
  )
}

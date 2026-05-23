import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AniListMedia } from '@/services/anime/anilist'

type AnimeSpotlightCardProps = {
  anime: AniListMedia
  index?: number
}

function titleOf(anime: AniListMedia) {
  return anime.title.english || anime.title.romaji || anime.title.native || 'Anime'
}

function fallbackPoster(title: string) {
  return `https://placehold.co/500x750/151520/9b7cff?text=${encodeURIComponent(title)}`
}

function SmartPoster({ src, title }: { src?: string | null; title: string }) {
  const [failed, setFailed] = useState(!src)
  const imageSrc = failed ? fallbackPoster(title) : String(src)

  return <img src={imageSrc} alt={title} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
}

export function AnimeSpotlightCard({ anime, index = 0 }: AnimeSpotlightCardProps) {
  const title = titleOf(anime)
  const poster = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.bannerImage || ''

  return (
    <article className="anime-card anime-tile spotlight-card" style={{ animationDelay: `${index * 35}ms` }}>
      <div className="spotlight-poster-wrap">
        <SmartPoster src={poster} title={title} />
        <div className="spotlight-gradient" />
        {anime.averageScore ? <span className="score-pill">★ {anime.averageScore}%</span> : null}
      </div>

      <div className="spotlight-content">
        <h3>{title}</h3>
        <p>{anime.genres?.slice(0, 3).join(' · ') || 'Anime'}</p>
        <div className="spotlight-meta">
          {anime.seasonYear ? <span>{anime.seasonYear}</span> : null}
          {anime.episodes ? <span>{anime.episodes} ep.</span> : null}
        </div>
      </div>
    </article>
  )
}

export function CommunityAnimeCard({ anime, compact = false }: { anime: { id: string; title: string; genre: string | null; poster_url: string; watch_url: string }; compact?: boolean }) {
  return (
    <article className="anime-card anime-tile spotlight-card community-card">
      <Link to={`/anime/${anime.id}`} className="spotlight-poster-wrap">
        <SmartPoster src={anime.poster_url} title={anime.title} />
        <div className="spotlight-gradient" />
      </Link>
      <div className="spotlight-content">
        <h3>{anime.title}</h3>
        <p>{anime.genre || 'Communauté'}</p>
        <div className="spotlight-actions">
          <Link className="primary-btn" to={`/anime/${anime.id}`}>Voir</Link>
          {!compact ? <a className="secondary-btn" href={anime.watch_url} target="_blank" rel="noreferrer">Regarder</a> : null}
        </div>
      </div>
    </article>
  )
}

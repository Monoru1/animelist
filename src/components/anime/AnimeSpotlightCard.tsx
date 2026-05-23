import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { AniListMedia } from '@/services/anime/anilist'

type AnimeSpotlightCardProps = {
  anime: AniListMedia
  index?: number
}

function titleOf(anime: AniListMedia) {
  return anime.title.english || anime.title.romaji || anime.title.native || 'Anime'
}

export function AnimeSpotlightCard({ anime, index = 0 }: AnimeSpotlightCardProps) {
  const title = titleOf(anime)
  const poster = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.bannerImage || ''

  return (
    <motion.article
      className="anime-card anime-tile spotlight-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.035 }}
    >
      <div className="spotlight-poster-wrap">
        {poster ? <img src={poster} alt={title} /> : <div className="poster-fallback">{title.slice(0, 1)}</div>}
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
    </motion.article>
  )
}

export function CommunityAnimeCard({ anime, compact = false }: { anime: { id: string; title: string; genre: string | null; poster_url: string; watch_url: string; profiles?: unknown }; compact?: boolean }) {
  return (
    <motion.article className="anime-card anime-tile spotlight-card community-card" whileHover={{ y: -6 }}>
      <Link to={`/anime/${anime.id}`} className="spotlight-poster-wrap">
        <img src={anime.poster_url} alt={anime.title} />
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
    </motion.article>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type WatchAnime = {
  id: string
  title: string
  description: string | null
  genre: string | null
  poster_url: string
  watch_url: string
}

type EpisodeSource = {
  id: string
  label: string
  language: string
  quality: string
  source_url: string
  source_type: string
  is_default: boolean
}

type Episode = {
  id: string
  season_number: number
  episode_number: number
  title: string | null
  synopsis: string | null
  thumbnail_url: string | null
  episode_sources?: EpisodeSource[] | null
}

type WatchPayload = {
  anime: WatchAnime
  episodes: Episode[]
}

async function fetchWatchPayload(animeId: string): Promise<WatchPayload> {
  const { data: anime, error: animeError } = await supabase
    .from('animes')
    .select('id,title,description,genre,poster_url,watch_url')
    .eq('id', animeId)
    .single()

  if (animeError) throw animeError

  const { data: episodes } = await supabase
    .from('anime_episodes')
    .select('id,season_number,episode_number,title,synopsis,thumbnail_url,episode_sources(id,label,language,quality,source_url,source_type,is_default)')
    .eq('anime_id', animeId)
    .order('season_number', { ascending: true })
    .order('episode_number', { ascending: true })

  return {
    anime: anime as WatchAnime,
    episodes: (episodes ?? []) as unknown as Episode[],
  }
}

async function saveWatchHistory(animeId: string, episodeId: string | undefined, progressSeconds = 0) {
  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  if (!userId) return

  await supabase.from('watch_history').upsert({
    user_id: userId,
    anime_id: animeId,
    progress_seconds: progressSeconds,
    last_watched_at: new Date().toISOString(),
  }, { onConflict: 'user_id,anime_id' })

  await supabase.from('watch_progress').upsert({
    user_id: userId,
    anime_id: animeId,
    episode_id: episodeId ?? null,
    progress_seconds: progressSeconds,
    completed: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,anime_id' })
}

function canEmbed(url: string) {
  if (!url || url === 'about:blank') return false
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function fallbackEpisode(anime: WatchAnime): Episode[] {
  return Array.from({ length: 12 }, (_, index) => ({
    id: `${anime.id}-${index + 1}`,
    season_number: 1,
    episode_number: index + 1,
    title: `Épisode ${index + 1}`,
    synopsis: anime.description,
    thumbnail_url: anime.poster_url,
    episode_sources: [],
  }))
}

export function WatchPlayerPage() {
  const { animeId = '' } = useParams()
  const [episodeIndex, setEpisodeIndex] = useState(0)
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)
  const { data, isLoading, error } = useQuery({
    queryKey: ['watch-payload', animeId],
    queryFn: () => fetchWatchPayload(animeId),
    enabled: Boolean(animeId),
  })

  const anime = data?.anime
  const episodes = useMemo(() => anime ? (data?.episodes?.length ? data.episodes : fallbackEpisode(anime)) : [], [anime, data?.episodes])
  const currentEpisode = episodes[episodeIndex] ?? episodes[0]
  const sources = currentEpisode?.episode_sources ?? []
  const selectedSource = sources.find((source) => source.id === selectedSourceId) ?? sources.find((source) => source.is_default) ?? sources[0]
  const playable = selectedSource?.source_url ? canEmbed(selectedSource.source_url) : false

  useEffect(() => {
    if (animeId) void saveWatchHistory(animeId, currentEpisode?.id, episodeIndex * 60)
  }, [animeId, episodeIndex, currentEpisode?.id])

  useEffect(() => {
    setSelectedSourceId(null)
  }, [episodeIndex])

  if (isLoading) return <section className="watch-page"><div className="surface-panel">Chargement du lecteur...</div></section>
  if (error || !anime) return <section className="watch-page"><div className="surface-panel">Impossible de charger cet anime.</div></section>

  return (
    <section className="watch-page viewer-mode">
      <div className="watch-player-shell">
        <div className="watch-player-main">
          <div className="watch-video-frame">
            {playable && selectedSource ? (
              selectedSource.source_type === 'video' || selectedSource.source_url.includes('.mp4') || selectedSource.source_url.includes('.webm') ? (
                <video src={selectedSource.source_url} controls autoPlay playsInline poster={currentEpisode?.thumbnail_url || anime.poster_url} />
              ) : (
                <iframe src={selectedSource.source_url} title={`Lecture ${anime.title}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              )
            ) : (
              <div className="watch-placeholder" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.92), rgba(0,0,0,.42)), url(${currentEpisode?.thumbnail_url || anime.poster_url})` }}>
                <div>
                  <p className="eyebrow">LECTEUR ANIMELIST</p>
                  <h1>{anime.title}</h1>
                  <p>La lecture interne sera disponible dès qu’une source compatible est activée pour cet épisode.</p>
                  <Link className="primary-btn" to={`/anime/${anime.id}`}>Retour à la fiche</Link>
                </div>
              </div>
            )}
          </div>

          <div className="watch-info surface-panel">
            <p className="eyebrow">SAISON {currentEpisode?.season_number ?? 1} · ÉPISODE {currentEpisode?.episode_number ?? episodeIndex + 1}</p>
            <h1>{anime.title}</h1>
            <p>{currentEpisode?.synopsis || anime.description || 'Aucune description disponible pour le moment.'}</p>

            {sources.length > 0 ? (
              <div className="source-pills">
                {sources.map((source) => (
                  <button key={source.id} type="button" className={selectedSource?.id === source.id ? 'source-pill active' : 'source-pill'} onClick={() => setSelectedSourceId(source.id)}>
                    {source.language} · {source.quality}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="watch-actions">
              <button className="secondary-btn" type="button" onClick={() => setEpisodeIndex((current) => Math.max(0, current - 1))}>Épisode précédent</button>
              <button className="primary-btn" type="button" onClick={() => setEpisodeIndex((current) => Math.min(episodes.length - 1, current + 1))}>Épisode suivant</button>
              <Link className="secondary-btn" to={`/anime/${anime.id}`}>Voir la fiche</Link>
            </div>
          </div>
        </div>

        <aside className="watch-sidebar surface-panel">
          <div>
            <p className="eyebrow">SAISON 1</p>
            <h2>Épisodes</h2>
          </div>
          <div className="episode-list">
            {episodes.map((item, index) => (
              <button key={item.id} type="button" className={index === episodeIndex ? 'episode-item active' : 'episode-item'} onClick={() => setEpisodeIndex(index)}>
                <img src={item.thumbnail_url || anime.poster_url} alt="" loading="lazy" />
                <span>EP {item.episode_number}</span>
                <small>{index === episodeIndex ? 'Lecture en cours' : item.title || anime.genre || 'Anime'}</small>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

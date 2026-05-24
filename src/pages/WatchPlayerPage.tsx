import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'
import { ROUTES } from '@/app/routes'

// ── Types ──────────────────────────────────────────────────────────
type EpisodeSource = {
  id: string
  label: string
  language: string
  quality: string
  source_url: string
  source_type: 'video' | 'hls' | 'embed' | 'iframe' | 'external' | string
  is_default: boolean
  is_active: boolean
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

type WatchAnime = {
  id: string
  title: string
  description: string | null
  genre: string | null
  poster_url: string
  watch_url: string | null
}

// ── Fetch ──────────────────────────────────────────────────────────
async function fetchWatchPayload(animeId: string) {
  const [{ data: anime, error: animeErr }, { data: episodes }] = await Promise.all([
    supabase
      .from('animes')
      .select('id,title,description,genre,poster_url,watch_url')
      .eq('id', animeId)
      .single(),
    supabase
      .from('anime_episodes')
      .select('id,season_number,episode_number,title,synopsis,thumbnail_url,episode_sources(id,label,language,quality,source_url,source_type,is_default,is_active)')
      .eq('anime_id', animeId)
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true }),
  ])
  if (animeErr) throw animeErr
  return {
    anime: anime as WatchAnime,
    episodes: (episodes ?? []) as unknown as Episode[],
  }
}

// ── Helpers ────────────────────────────────────────────────────────
function activeSources(sources: EpisodeSource[]): EpisodeSource[] {
  return sources.filter((s) => s.is_active !== false)
}

function detectType(url: string): string {
  const u = url.toLowerCase()
  if (u.includes('.mp4') || u.includes('.webm') || u.includes('.mkv')) return 'video'
  if (u.includes('.m3u8')) return 'hls'
  return 'embed'
}

function isNativeVideo(source: EpisodeSource): boolean {
  const t = source.source_type || detectType(source.source_url)
  return t === 'video' || t === 'hls'
}

function langLabel(language: string): string {
  const u = language.toUpperCase()
  if (u.includes('VF') && u.includes('VOSTFR')) return 'VF/VOSTFR'
  if (u.includes('VF')) return 'VF'
  return 'VOSTFR'
}

function qualLabel(quality: string): string {
  const u = quality.toUpperCase()
  if (u.includes('1080')) return '1080p'
  if (u.includes('720')) return '720p'
  if (u.includes('SD')) return 'SD'
  return 'HD'
}

function pillLabel(s: EpisodeSource) {
  return `${langLabel(s.language)} ${qualLabel(s.quality)}`
}

// Génère des épisodes fantômes si la table anime_episodes est vide
function phantomEpisodes(anime: WatchAnime, count = 13): Episode[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `__phantom__${anime.id}__${i + 1}`,
    season_number: 1,
    episode_number: i + 1,
    title: `Épisode ${i + 1}`,
    synopsis: anime.description,
    thumbnail_url: anime.poster_url,
    episode_sources: [],
  }))
}

// ── Sauvegarde historique + progression ────────────────────────────
async function saveProgress(animeId: string, episodeId: string | null, seconds: number) {
  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  if (!userId) return
  await Promise.all([
    supabase.from('watch_history').upsert(
      { user_id: userId, anime_id: animeId, progress_seconds: seconds, last_watched_at: new Date().toISOString() },
      { onConflict: 'user_id,anime_id' }
    ),
    supabase.from('watch_progress').upsert(
      { user_id: userId, anime_id: animeId, episode_id: episodeId, progress_seconds: seconds, completed: false, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,anime_id' }
    ),
  ])
}

// ── Composant principal ────────────────────────────────────────────
export function WatchPlayerPage() {
  const { animeId = '' } = useParams()
  const [epIdx, setEpIdx]               = useState(0)
  const [selectedSourceId, setSelSrcId] = useState<string | null>(null)
  const [iframeError, setIframeError]   = useState(false)
  const [reportSent, setReportSent]     = useState(false)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const saveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['watch-payload', animeId],
    queryFn: () => fetchWatchPayload(animeId),
    enabled: Boolean(animeId),
  })

  const anime    = data?.anime
  const rawEps   = data?.episodes ?? []
  const episodes = useMemo(
    () => anime ? (rawEps.length ? rawEps : phantomEpisodes(anime)) : [],
    [anime, rawEps]
  )

  const currentEp   = episodes[epIdx] ?? episodes[0] ?? null
  const allSources  = activeSources(currentEp?.episode_sources ?? [])
  const selectedSrc = allSources.find((s) => s.id === selectedSourceId)
    ?? allSources.find((s) => s.is_default)
    ?? allSources[0]
    ?? null

  const hasSources = allSources.length > 0
  const isVideo    = selectedSrc ? isNativeVideo(selectedSrc) : false

  // Reset source + erreur iframe au changement d'épisode
  useEffect(() => {
    setSelSrcId(null)
    setIframeError(false)
    setReportSent(false)
  }, [epIdx])

  // Sauvegarde progression toutes les 30s sur lecteur natif
  useEffect(() => {
    if (!anime || !currentEp) return
    void saveProgress(anime.id, currentEp.id, 0)

    if (isVideo && videoRef.current) {
      saveTimer.current = setInterval(() => {
        const t = videoRef.current?.currentTime ?? 0
        void saveProgress(anime.id, currentEp.id, Math.round(t))
      }, 30_000)
    }
    return () => {
      if (saveTimer.current) clearInterval(saveTimer.current)
    }
  }, [anime, currentEp, isVideo])

  const goNext = useCallback(() => setEpIdx((i) => Math.min(episodes.length - 1, i + 1)), [episodes.length])
  const goPrev = useCallback(() => setEpIdx((i) => Math.max(0, i - 1)),                   [])

  async function reportSource() {
    if (!selectedSrc || !animeId || reportSent) return
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    await supabase.from('source_reports').insert({
      source_id: selectedSrc.id,
      anime_id: animeId,
      episode_id: currentEp?.id ?? null,
      reported_by: userId ?? null,
      reason: 'Source cassée signalée par utilisateur',
    })
    setReportSent(true)
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="watch-loading">
      <div className="watch-loading-inner">
        <div className="watch-spinner" />
        <p>Chargement du lecteur…</p>
      </div>
    </div>
  )

  if (error || !anime) return (
    <div className="watch-loading">
      <div className="watch-loading-inner">
        <p style={{ color: '#ef4444' }}>Impossible de charger cet anime.</p>
        <Link className="secondary-btn" to={ROUTES.LIBRARY}>Retour</Link>
      </div>
    </div>
  )

  // ── Rendu ────────────────────────────────────────────────────────
  return (
    <div className="watch-root">

      {/* ── Zone lecteur ──────────────────────────────────────── */}
      <div className="watch-layout">

        {/* Colonne gauche : player + infos */}
        <div className="watch-main">

          {/* Frame vidéo */}
          <div className="watch-frame">
            {hasSources && selectedSrc && !iframeError ? (
              isVideo ? (
                <video
                  ref={videoRef}
                  key={selectedSrc.id}
                  src={selectedSrc.source_url}
                  controls
                  autoPlay
                  playsInline
                  poster={currentEp?.thumbnail_url || anime.poster_url}
                  className="watch-video"
                  onError={() => setIframeError(true)}
                />
              ) : (
                <iframe
                  key={selectedSrc.id}
                  src={selectedSrc.source_url}
                  title={`${anime.title} — Épisode ${currentEp?.episode_number ?? epIdx + 1}`}
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                  className="watch-iframe"
                  onError={() => setIframeError(true)}
                />
              )
            ) : (
              /* Fallback premium */
              <div
                className="watch-fallback"
                style={{
                  backgroundImage: `linear-gradient(160deg,rgba(10,10,14,.97) 0%,rgba(10,10,14,.82) 50%,rgba(10,10,14,.55) 100%), url(${currentEp?.thumbnail_url || anime.poster_url})`,
                }}
              >
                <div className="watch-fallback-inner">
                  <p className="eyebrow">LECTEUR ANIMELIST</p>
                  <h2>{anime.title}</h2>
                  <p className="watch-fallback-sub">
                    {iframeError
                      ? 'Cette source ne peut pas être lue ici. Essaie une autre source ou signale le problème.'
                      : "Aucune source disponible pour cet épisode. L'admin peut en ajouter depuis le panel."}
                  </p>
                  <div className="watch-fallback-actions">
                    <Link className="secondary-btn" to={ROUTES.ANIME_DETAIL(anime.id)}>← Fiche anime</Link>
                    {iframeError && !reportSent ? (
                      <button className="secondary-btn" type="button" onClick={() => void reportSource()}>
                        ⚑ Signaler la source
                      </button>
                    ) : null}
                    {reportSent ? <span className="watch-reported">✓ Signalement envoyé</span> : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barre de contrôle sous le player */}
          <div className="watch-controls surface-panel">
            <div className="watch-controls-top">
              <div className="watch-ep-label">
                <span className="eyebrow">S{currentEp?.season_number ?? 1} · EP{currentEp?.episode_number ?? epIdx + 1}</span>
                <h1 className="watch-title">{anime.title}</h1>
              </div>

              {/* Source switcher VF/VOSTFR */}
              {hasSources && allSources.length > 1 ? (
                <div className="source-switcher" role="group" aria-label="Choisir la source">
                  {allSources.map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      className={`source-pill${selectedSrc?.id === src.id ? ' active' : ''}`}
                      onClick={() => { setSelSrcId(src.id); setIframeError(false) }}
                    >
                      {pillLabel(src)}
                    </button>
                  ))}
                </div>
              ) : hasSources && selectedSrc ? (
                <span className="source-single-label">{pillLabel(selectedSrc)}</span>
              ) : null}
            </div>

            {/* Desc + nav épisodes */}
            {currentEp?.synopsis || anime.description ? (
              <p className="watch-synopsis">
                {currentEp?.synopsis || anime.description}
              </p>
            ) : null}

            <div className="watch-nav-btns">
              <button
                className="secondary-btn"
                type="button"
                disabled={epIdx === 0}
                onClick={goPrev}
              >← Épisode précédent</button>
              <button
                className="primary-btn"
                type="button"
                disabled={epIdx >= episodes.length - 1}
                onClick={goNext}
              >Épisode suivant →</button>
              <Link className="secondary-btn" to={ROUTES.ANIME_DETAIL(anime.id)}>Fiche anime</Link>
              {hasSources && selectedSrc && !iframeError ? (
                <button
                  className="secondary-btn watch-report-btn"
                  type="button"
                  onClick={() => void reportSource()}
                  disabled={reportSent}
                >
                  {reportSent ? '✓ Signalé' : '⚑ Signaler'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Colonne droite : sidebar épisodes */}
        <aside className="watch-sidebar surface-panel">
          <div className="watch-sidebar-head">
            <p className="eyebrow">ÉPISODES</p>
            <span className="watch-sidebar-count">{episodes.length} ep.</span>
          </div>
          <div className="episode-list">
            {episodes.map((ep, idx) => {
              const epSources = activeSources(ep.episode_sources ?? [])
              const hasEpSrc  = epSources.length > 0
              return (
                <button
                  key={ep.id}
                  type="button"
                  className={`episode-item${idx === epIdx ? ' active' : ''}${!hasEpSrc ? ' episode-item--no-src' : ''}`}
                  onClick={() => setEpIdx(idx)}
                  title={ep.title ?? `Épisode ${ep.episode_number}`}
                >
                  <div className="episode-thumb-wrap">
                    <img
                      src={ep.thumbnail_url || anime.poster_url}
                      alt=""
                      loading="lazy"
                    />
                    {idx === epIdx ? (
                      <span className="episode-playing-indicator">▶</span>
                    ) : null}
                    {!hasEpSrc ? (
                      <span className="episode-no-src-badge">—</span>
                    ) : null}
                  </div>
                  <div className="episode-info">
                    <span className="episode-num">EP {ep.episode_number}</span>
                    <small className="episode-title-text">
                      {idx === epIdx ? 'En cours' : (ep.title || anime.genre || 'Anime')}
                    </small>
                    {hasEpSrc ? (
                      <span className="episode-lang-pills">
                        {epSources.map((s) => (
                          <span key={s.id} className="episode-lang-pill">{langLabel(s.language)}</span>
                        ))}
                      </span>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'
import { ROUTES } from '@/app/routes'
import { WatchChatPanel } from '@/features/chat/components/WatchChatPanel'

type EpisodeSource = {
  id: string; label: string; language: string; quality: string
  source_url: string; source_type: string; is_default: boolean; is_active: boolean
}
type Episode = {
  id: string; season_number: number; episode_number: number
  title: string | null; synopsis: string | null; thumbnail_url: string | null
  episode_sources?: EpisodeSource[] | null
}
type WatchAnime = {
  id: string; title: string; description: string | null
  genre: string | null; poster_url: string; watch_url: string | null
}

async function fetchWatchPayload(animeId: string) {
  const [animeRes, episodesRes] = await Promise.all([
    supabase.from('animes').select('id,title,description,genre,poster_url,watch_url').eq('id', animeId).single(),
    supabase.from('anime_episodes')
      .select('id,season_number,episode_number,title,synopsis,thumbnail_url,episode_sources(id,label,language,quality,source_url,source_type,is_default,is_active)')
      .eq('anime_id', animeId)
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true }),
  ])
  if (animeRes.error) throw animeRes.error
  return {
    anime: animeRes.data as WatchAnime,
    episodes: (episodesRes.data ?? []) as unknown as Episode[],
  }
}

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

function activeSrc(sources: EpisodeSource[]) { return sources.filter(s => s.is_active !== false) }
function isVideo(s: EpisodeSource) {
  const t = (s.source_type || '').toLowerCase()
  const u = s.source_url.toLowerCase()
  return t === 'video' || t === 'hls' || u.includes('.mp4') || u.includes('.webm') || u.includes('.m3u8')
}
function langLabel(l: string) {
  const u = l.toUpperCase()
  if (u.includes('VF') && u.includes('VOSTFR')) return 'VF/VOSTFR'
  return u.includes('VF') ? 'VF' : 'VOSTFR'
}
function qualLabel(q: string) {
  const u = q.toUpperCase()
  if (u.includes('1080')) return '1080p'
  if (u.includes('720')) return '720p'
  if (u.includes('SD')) return 'SD'
  return 'HD'
}
function pillLabel(s: EpisodeSource) { return `${langLabel(s.language)} ${qualLabel(s.quality)}` }
function phantomEps(anime: WatchAnime, n = 12): Episode[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `__p__${anime.id}__${i + 1}`, season_number: 1, episode_number: i + 1,
    title: `Épisode ${i + 1}`, synopsis: anime.description,
    thumbnail_url: anime.poster_url, episode_sources: [],
  }))
}

export function WatchPlayerPage() {
  const { animeId = '' } = useParams()
  const [epIdx, setEpIdx]         = useState(0)
  const [selSrcId, setSelSrcId]   = useState<string | null>(null)
  const [iframeErr, setIframeErr] = useState(false)
  const [reported, setReported]   = useState(false)
  const [chatOpen, setChatOpen]   = useState(false)
  const [userId, setUserId]       = useState('')
  const videoRef  = useRef<HTMLVideoElement>(null)
  const saveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['watch-payload', animeId],
    queryFn: () => fetchWatchPayload(animeId),
    enabled: Boolean(animeId),
    retry: 1,
  })

  const anime    = data?.anime
  const rawEps   = data?.episodes ?? []
  const episodes = useMemo(() => anime ? (rawEps.length ? rawEps : phantomEps(anime)) : [], [anime, rawEps])
  const currentEp   = episodes[epIdx] ?? null
  const allSources  = activeSrc(currentEp?.episode_sources ?? [])
  const selectedSrc = allSources.find(s => s.id === selSrcId)
    ?? allSources.find(s => s.is_default)
    ?? allSources[0]
    ?? null
  const hasSources = allSources.length > 0
  const isVid      = selectedSrc ? isVideo(selectedSrc) : false

  useEffect(() => { setSelSrcId(null); setIframeErr(false); setReported(false) }, [epIdx])

  useEffect(() => {
    if (!anime || !currentEp) return
    void saveProgress(anime.id, currentEp.id.startsWith('__p__') ? null : currentEp.id, 0)
    if (isVid && videoRef.current) {
      saveTimer.current = setInterval(() => {
        void saveProgress(
          anime.id,
          currentEp.id.startsWith('__p__') ? null : currentEp.id,
          Math.round(videoRef.current?.currentTime ?? 0)
        )
      }, 30_000)
    }
    return () => { if (saveTimer.current) clearInterval(saveTimer.current) }
  }, [anime, currentEp, isVid])

  const goNext = useCallback(() => setEpIdx(i => Math.min(episodes.length - 1, i + 1)), [episodes.length])
  const goPrev = useCallback(() => setEpIdx(i => Math.max(0, i - 1)), [])

  async function reportSource() {
    if (!selectedSrc || reported) return
    const { data: authData } = await supabase.auth.getUser()
    await supabase.from('source_reports').insert({
      source_id: selectedSrc.id, anime_id: animeId,
      episode_id: currentEp?.id.startsWith('__p__') ? null : (currentEp?.id ?? null),
      reported_by: authData.user?.id ?? null,
      reason: 'Source cassée signalée par utilisateur',
    })
    setReported(true)
  }

  // ── Écran de chargement ─────────────────────────────────────────
  if (isLoading) return (
    <div className="watch-loading">
      <div className="watch-loading-inner">
        <div className="watch-spinner" />
        <p>Chargement du lecteur…</p>
      </div>
    </div>
  )

  // ── Erreur / anime introuvable ──────────────────────────────────
  if (error || !anime) return (
    <div className="watch-loading">
      <div className="watch-loading-inner" style={{ gap: 20 }}>
        <div className="empty-state-icon" style={{ fontSize: 40 }}>🎌</div>
        <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Anime introuvable</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          {error ? `Erreur : ${(error as Error).message}` : "Cet anime n'existe pas ou a été supprimé."}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link className="primary-btn" to={ROUTES.LIBRARY}>Retour à la bibliothèque</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="watch-root">
      <div className="watch-layout">

        {/* ── Colonne main ─────────────────────────────────────── */}
        <div className="watch-main">

          {/* Frame */}
          <div className="watch-frame">
            {hasSources && selectedSrc && !iframeErr ? (
              isVid ? (
                <video
                  ref={videoRef} key={selectedSrc.id}
                  src={selectedSrc.source_url} controls autoPlay playsInline
                  poster={currentEp?.thumbnail_url || anime.poster_url}
                  className="watch-video"
                  onError={() => setIframeErr(true)}
                />
              ) : (
                <iframe
                  key={selectedSrc.id}
                  src={selectedSrc.source_url}
                  title={`${anime.title} EP${currentEp?.episode_number ?? epIdx + 1}`}
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                  className="watch-iframe"
                  onError={() => setIframeErr(true)}
                />
              )
            ) : (
              <div
                className="watch-fallback"
                style={{ backgroundImage: `linear-gradient(160deg,rgba(10,10,14,.97),rgba(10,10,14,.6)),url(${currentEp?.thumbnail_url || anime.poster_url})` }}
              >
                <div className="watch-fallback-inner">
                  <p className="eyebrow">ANIMELIST PLAYER</p>
                  <h2>{anime.title}</h2>
                  <p className="watch-fallback-sub">
                    {iframeErr
                      ? "Cette source ne peut pas être lue ici. Essaie une autre source ou signale le problème."
                      : "Aucune source disponible pour cet épisode. Un admin peut en ajouter depuis le panel."}
                  </p>
                  <div className="watch-fallback-actions">
                    <Link className="secondary-btn" to={ROUTES.ANIME_DETAIL(anime.id)}>← Fiche anime</Link>
                    {iframeErr && !reported ? (
                      <button className="secondary-btn" type="button" onClick={() => void reportSource()}>⚑ Signaler</button>
                    ) : null}
                    {reported ? <span className="watch-reported">✓ Signalé</span> : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contrôles */}
          <div className="watch-controls surface-panel">
            <div className="watch-controls-top">
              <div className="watch-ep-label">
                <span className="eyebrow">S{currentEp?.season_number ?? 1} · EP{currentEp?.episode_number ?? epIdx + 1}</span>
                <h1 className="watch-title">{anime.title}</h1>
              </div>
              <div className="watch-controls-right">
                {hasSources && allSources.length > 1 ? (
                  <div className="source-switcher" role="group" aria-label="Source">
                    {allSources.map(src => (
                      <button key={src.id} type="button"
                        className={`source-pill${selectedSrc?.id === src.id ? ' active' : ''}`}
                        onClick={() => { setSelSrcId(src.id); setIframeErr(false) }}>
                        {pillLabel(src)}
                      </button>
                    ))}
                  </div>
                ) : hasSources && selectedSrc ? (
                  <span className="source-single-label">{pillLabel(selectedSrc)}</span>
                ) : null}
                {/* Bouton chat — visible sur tous les écrans */}
                <button
                  type="button"
                  className={`chat-toggle-btn${chatOpen ? ' active' : ''}`}
                  onClick={() => setChatOpen(v => !v)}
                  aria-label="Chat en direct"
                >💬 Chat</button>
              </div>
            </div>

            {currentEp?.synopsis || anime.description ? (
              <p className="watch-synopsis">{currentEp?.synopsis || anime.description}</p>
            ) : null}

            <div className="watch-nav-btns">
              <button className="secondary-btn" type="button" disabled={epIdx === 0} onClick={goPrev}>← Précédent</button>
              <button className="primary-btn"   type="button" disabled={epIdx >= episodes.length - 1} onClick={goNext}>Suivant →</button>
              <Link className="secondary-btn" to={ROUTES.ANIME_DETAIL(anime.id)}>Fiche anime</Link>
              {hasSources && selectedSrc && !iframeErr ? (
                <button className="secondary-btn watch-report-btn" type="button"
                  onClick={() => void reportSource()} disabled={reported}>
                  {reported ? '✓ Signalé' : '⚑ Signaler'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Colonne droite : épisodes ─────────────────────── */}
        <aside className="watch-sidebar surface-panel">
          <div className="watch-sidebar-head">
            <p className="eyebrow">ÉPISODES</p>
            <span className="watch-sidebar-count">{episodes.length} ep.</span>
          </div>
          <div className="episode-list">
            {episodes.map((ep, idx) => {
              const epSrc = activeSrc(ep.episode_sources ?? [])
              return (
                <button key={ep.id} type="button"
                  className={`episode-item${idx === epIdx ? ' active' : ''}${!epSrc.length ? ' episode-item--no-src' : ''}`}
                  onClick={() => setEpIdx(idx)}>
                  <div className="episode-thumb-wrap">
                    <img src={ep.thumbnail_url || anime.poster_url} alt="" loading="lazy" />
                    {idx === epIdx ? <span className="episode-playing-indicator">▶</span> : null}
                    {!epSrc.length ? <span className="episode-no-src-badge">—</span> : null}
                  </div>
                  <div className="episode-info">
                    <span className="episode-num">EP {ep.episode_number}</span>
                    <small className="episode-title-text">
                      {idx === epIdx ? 'En cours' : (ep.title || anime.genre || 'Anime')}
                    </small>
                    {epSrc.length > 0 ? (
                      <span className="episode-lang-pills">
                        {epSrc.map(s => <span key={s.id} className="episode-lang-pill">{langLabel(s.language)}</span>)}
                      </span>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      {/* ── Chat — bottom sheet mobile + panel desktop ────────── */}
      {userId ? (
        <WatchChatPanel
          animeId={animeId}
          episodeId={currentEp?.id.startsWith('__p__') ? null : (currentEp?.id ?? null)}
          currentUserId={userId}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      ) : null}
    </div>
  )
}

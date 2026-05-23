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

async function fetchWatchAnime(animeId: string): Promise<WatchAnime> {
  const { data, error } = await supabase
    .from('animes')
    .select('id,title,description,genre,poster_url,watch_url')
    .eq('id', animeId)
    .single()

  if (error) throw error
  return data as WatchAnime
}

async function saveWatchHistory(animeId: string) {
  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  if (!userId) return

  await supabase.from('watch_history').upsert({
    user_id: userId,
    anime_id: animeId,
    last_watched_at: new Date().toISOString(),
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

export function WatchPlayerPage() {
  const { animeId = '' } = useParams()
  const [episode, setEpisode] = useState(1)
  const { data: anime, isLoading, error } = useQuery({
    queryKey: ['watch-anime', animeId],
    queryFn: () => fetchWatchAnime(animeId),
    enabled: Boolean(animeId),
  })

  useEffect(() => {
    if (animeId) void saveWatchHistory(animeId)
  }, [animeId])

  const episodes = useMemo(() => Array.from({ length: 12 }, (_, index) => index + 1), [])
  const embeddable = anime?.watch_url ? canEmbed(anime.watch_url) : false

  if (isLoading) return <section className="watch-page"><div className="surface-panel">Chargement du lecteur...</div></section>
  if (error || !anime) return <section className="watch-page"><div className="surface-panel">Impossible de charger cet anime.</div></section>

  return (
    <section className="watch-page">
      <div className="watch-player-shell">
        <div className="watch-player-main">
          <div className="watch-video-frame">
            {embeddable ? (
              <iframe
                src={anime.watch_url}
                title={`Lecture ${anime.title}`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="watch-placeholder" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.88), rgba(0,0,0,.35)), url(${anime.poster_url})` }}>
                <div>
                  <p className="eyebrow">LECTEUR ANIMELIST</p>
                  <h1>{anime.title}</h1>
                  <p>La source directe de lecture n’est pas encore disponible. Ajoute une source intégrable ou ouvre la source externe en secours.</p>
                  {anime.watch_url && anime.watch_url !== 'about:blank' ? <a className="primary-btn" href={anime.watch_url} target="_blank" rel="noreferrer">Ouvrir la source</a> : null}
                </div>
              </div>
            )}
          </div>

          <div className="watch-info surface-panel">
            <p className="eyebrow">ÉPISODE {episode}</p>
            <h1>{anime.title}</h1>
            <p>{anime.description || 'Aucune description disponible pour le moment.'}</p>
            <div className="watch-actions">
              <button className="secondary-btn" type="button" onClick={() => setEpisode((current) => Math.max(1, current - 1))}>Épisode précédent</button>
              <button className="primary-btn" type="button" onClick={() => setEpisode((current) => current + 1)}>Épisode suivant</button>
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
            {episodes.map((item) => (
              <button key={item} type="button" className={item === episode ? 'episode-item active' : 'episode-item'} onClick={() => setEpisode(item)}>
                <span>EP {item}</span>
                <small>{item === episode ? 'Lecture en cours' : anime.genre || 'Anime'}</small>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

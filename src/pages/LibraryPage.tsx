import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'
import { AnimeSpotlightCard, CommunityAnimeCard } from '@/components/anime/AnimeSpotlightCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { fetchAniListPopular, fetchAniListTrending } from '@/services/anime/anilist'
import { fetchJikanSeasonNow, fetchJikanTop } from '@/services/anime/jikan'

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

async function fetchAnimes(): Promise<LibraryAnime[]> {
  const { data, error } = await supabase
    .from('animes')
    .select('id,user_id,title,description,genre,poster_url,watch_url,created_at,profiles(username,avatar_url)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as LibraryAnime[]
}

function toCommunityCard(anime: LibraryAnime) {
  return {
    id: anime.id,
    title: anime.title,
    genre: anime.genre,
    poster_url: anime.poster_url,
    watch_url: anime.watch_url,
  }
}

export function LibraryPage() {
  const [search, setSearch] = useState('')
  const { data: animes = [], isLoading, error } = useQuery({ queryKey: ['public-animes'], queryFn: fetchAnimes })
  const { data: trending = [] } = useQuery({ queryKey: ['anilist-trending'], queryFn: () => fetchAniListTrending(14), staleTime: 1000 * 60 * 20 })
  const { data: popular = [] } = useQuery({ queryKey: ['anilist-popular'], queryFn: () => fetchAniListPopular(14), staleTime: 1000 * 60 * 40 })
  const { data: seasonal = [] } = useQuery({ queryKey: ['jikan-season-now'], queryFn: () => fetchJikanSeasonNow(12), staleTime: 1000 * 60 * 40 })
  const { data: topMal = [] } = useQuery({ queryKey: ['jikan-top'], queryFn: () => fetchJikanTop(12), staleTime: 1000 * 60 * 60 })

  const filteredAnimes = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return animes
    return animes.filter((anime) => anime.title.toLowerCase().includes(value) || (anime.genre ?? '').toLowerCase().includes(value))
  }, [animes, search])

  const featuredAnime = filteredAnimes[0]
  const recentAnimes = filteredAnimes.slice(0, 14)
  const communityPopular = [...filteredAnimes].sort((a, b) => a.title.localeCompare(b.title)).slice(0, 14)
  const actionAnimes = filteredAnimes.filter((anime) => (anime.genre ?? '').toLowerCase().includes('action')).slice(0, 14)
  const heroImage = featuredAnime?.poster_url || trending[0]?.bannerImage || trending[0]?.coverImage?.extraLarge || ''
  const heroTitle = featuredAnime?.title || trending[0]?.title.english || trending[0]?.title.romaji || 'Anime OS'
  const heroDescription = featuredAnime?.description || trending[0]?.description || 'Découvre les tendances, les ajouts communauté, les favoris et les recommandations anime dans une expérience streaming premium.'

  return (
    <section>
      <div className="cinematic-hero" style={{ backgroundImage: heroImage ? `linear-gradient(90deg, rgba(10,10,11,.98), rgba(10,10,11,.72), rgba(10,10,11,.24)), url(${heroImage})` : undefined }}>
        <div className="hero-copy">
          <p className="eyebrow">ANIME OS · COMMUNAUTÉ NEXT-GEN</p>
          <h1>{heroTitle}</h1>
          <p>{heroDescription}</p>
          <div className="hero-actions">
            {featuredAnime ? <Link className="primary-btn" to={`/anime/${featuredAnime.id}`}>Regarder maintenant</Link> : null}
            <Link className="secondary-btn" to="/add">Ajouter un anime</Link>
          </div>
          <input className="input-field hero-search" placeholder="Rechercher un anime, un genre, une vibe..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      {isLoading ? <div className="surface-panel">Chargement de la communauté...</div> : null}
      {error ? <div className="surface-panel">Impossible de charger la bibliothèque.</div> : null}

      {trending.length > 0 ? (
        <section className="home-section">
          <SectionHeader badge="AniList Live" title="Tendances maintenant" subtitle="Les animés qui montent en puissance dans la communauté anime mondiale." />
          <div className="anime-row">
            {trending.map((anime, index) => <AnimeSpotlightCard key={anime.id} anime={anime} index={index} />)}
          </div>
        </section>
      ) : null}

      {recentAnimes.length > 0 ? (
        <section className="home-section">
          <SectionHeader badge="Communauté" title="Récemment ajoutés" subtitle="Les derniers liens anime ajoutés par les utilisateurs d’Animelist." />
          <div className="anime-row">
            {recentAnimes.map((anime) => <CommunityAnimeCard key={anime.id} anime={toCommunityCard(anime)} />)}
          </div>
        </section>
      ) : null}

      {popular.length > 0 ? (
        <section className="home-section">
          <SectionHeader badge="Global" title="Populaires cette semaine" subtitle="Une sélection populaire issue du moteur AniList." />
          <div className="anime-row">
            {popular.map((anime, index) => <AnimeSpotlightCard key={anime.id} anime={anime} index={index} />)}
          </div>
        </section>
      ) : null}

      {seasonal.length > 0 ? (
        <section className="home-section">
          <SectionHeader badge="Saison" title="Nouveautés saisonnières" subtitle="Les sorties actuelles enrichies via Jikan / MyAnimeList." />
          <div className="anime-row">
            {seasonal.map((anime) => (
              <article key={anime.mal_id} className="anime-card anime-tile spotlight-card">
                <div className="spotlight-poster-wrap">
                  <img src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''} alt={anime.title || 'Anime'} />
                  <div className="spotlight-gradient" />
                  {anime.score ? <span className="score-pill">★ {anime.score}</span> : null}
                </div>
                <div className="spotlight-content">
                  <h3>{anime.title_english || anime.title}</h3>
                  <p>{anime.genres?.slice(0, 3).map((genre) => genre.name).join(' · ') || 'Saison en cours'}</p>
                  <div className="spotlight-meta">
                    {anime.year ? <span>{anime.year}</span> : null}
                    {anime.episodes ? <span>{anime.episodes} ep.</span> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {communityPopular.length > 0 ? (
        <section className="home-section">
          <SectionHeader badge="Top communauté" title="Populaires sur Animelist" subtitle="Les contenus communauté mis en avant dans la bibliothèque." />
          <div className="anime-row">
            {communityPopular.map((anime) => <CommunityAnimeCard key={anime.id} anime={toCommunityCard(anime)} compact />)}
          </div>
        </section>
      ) : null}

      {actionAnimes.length > 0 ? (
        <section className="home-section">
          <SectionHeader badge="Recommandations" title="Parce que tu aimes l’action" subtitle="Sélection locale basée sur les genres ajoutés par la communauté." />
          <div className="anime-row">
            {actionAnimes.map((anime) => <CommunityAnimeCard key={anime.id} anime={toCommunityCard(anime)} compact />)}
          </div>
        </section>
      ) : null}

      {topMal.length > 0 ? (
        <section className="home-section">
          <SectionHeader badge="MAL" title="Classiques incontournables" subtitle="Top anime récupéré via Jikan pour enrichir la découverte." />
          <div className="anime-row">
            {topMal.map((anime) => (
              <article key={anime.mal_id} className="anime-card anime-tile spotlight-card">
                <div className="spotlight-poster-wrap">
                  <img src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''} alt={anime.title || 'Anime'} />
                  <div className="spotlight-gradient" />
                  {anime.score ? <span className="score-pill">★ {anime.score}</span> : null}
                </div>
                <div className="spotlight-content">
                  <h3>{anime.title_english || anime.title}</h3>
                  <p>{anime.studios?.slice(0, 2).map((studio) => studio.name).join(' · ') || 'Classique anime'}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading && filteredAnimes.length === 0 ? <div className="surface-panel">Aucun anime trouvé pour cette recherche.</div> : null}
    </section>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CommunityAnimeCard, AnimeSpotlightCard } from '@/components/anime/AnimeSpotlightCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { fetchAniListPopular, fetchAniListTrending } from '@/services/anime/anilist'
import { fetchJikanSeasonNow, fetchJikanTop } from '@/services/anime/jikan'
import { usePublicAnimes } from '@/features/library/hooks/useAnimes'
import { useWatchHistory } from '@/features/watch/hooks/useWatchHistory'
import { getHistoryAnime } from '@/features/watch/api/watchHistory'
import { ROUTES } from '@/app/routes'

function SkeletonCard() {
  return (
    <div className="anime-card anime-tile spotlight-card skeleton-card" aria-hidden="true">
      <div className="skeleton-poster" />
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--sub" />
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="anime-row" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

function ContinueWatchingRow() {
  const { data: history = [], isLoading } = useWatchHistory()
  if (isLoading) return <SkeletonRow />
  if (!history.length) return null

  return (
    <section className="home-section">
      <SectionHeader badge="Reprendre" title="Continuer à regarder" subtitle="Reprends là où tu t'étais arrêté." />
      <div className="anime-row">
        {history.slice(0, 12).map((item) => {
          const anime = getHistoryAnime(item.animes)
          if (!anime) return null
          return (
            <article key={item.id} className="anime-card anime-tile spotlight-card continue-card">
              <Link to={ROUTES.WATCH(anime.id)} className="spotlight-poster-wrap">
                <img src={anime.poster_url} alt={anime.title} loading="lazy" />
                <div className="spotlight-gradient" />
                <div className="continue-play-overlay">
                  <span className="continue-play-btn">▶</span>
                </div>
              </Link>
              <div className="spotlight-content">
                <h3>{anime.title}</h3>
                <p>{anime.genre || 'Anime'}</p>
                <div className="spotlight-actions">
                  <Link className="primary-btn" to={ROUTES.WATCH(anime.id)}>▶ Reprendre</Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function LibraryPage() {
  const [search, setSearch] = useState('')

  const { data: animes = [], isLoading: animesLoading, error: animesError } = usePublicAnimes()
  const { data: trending = [], isLoading: trendingLoading } = useQuery({
    queryKey: ['anilist-trending'],
    queryFn: () => fetchAniListTrending(16),
    staleTime: 1000 * 60 * 20,
  })
  const { data: popular = [] } = useQuery({
    queryKey: ['anilist-popular'],
    queryFn: () => fetchAniListPopular(16),
    staleTime: 1000 * 60 * 40,
  })
  const { data: seasonal = [] } = useQuery({
    queryKey: ['jikan-season-now'],
    queryFn: () => fetchJikanSeasonNow(14),
    staleTime: 1000 * 60 * 40,
  })
  const { data: topMal = [] } = useQuery({
    queryKey: ['jikan-top'],
    queryFn: () => fetchJikanTop(14),
    staleTime: 1000 * 60 * 60,
  })

  const filteredAnimes = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return animes
    return animes.filter(
      (a) => a.title.toLowerCase().includes(q) || (a.genre ?? '').toLowerCase().includes(q)
    )
  }, [animes, search])

  const featuredAnime = filteredAnimes[0]
  const recentAnimes = filteredAnimes.slice(0, 16)
  const communityPopular = [...filteredAnimes].sort((a, b) => a.title.localeCompare(b.title)).slice(0, 14)
  const actionAnimes = filteredAnimes.filter((a) => (a.genre ?? '').toLowerCase().includes('action')).slice(0, 14)

  const heroImage =
    featuredAnime?.poster_url ||
    trending[0]?.bannerImage ||
    trending[0]?.coverImage?.extraLarge || ''
  const heroTitle =
    featuredAnime?.title ||
    trending[0]?.title?.english ||
    trending[0]?.title?.romaji ||
    'Anime OS'
  const heroDescription =
    featuredAnime?.description?.slice(0, 200) ||
    trending[0]?.description?.replace(/<[^>]*>/g, '').slice(0, 200) ||
    'Découvre les tendances, les ajouts communauté et les recommandations anime dans une expérience streaming premium.'

  return (
    <section className="library-page">

      {/* ── HERO CINÉMATIQUE ───────────────────────────────────────── */}
      <div
        className="cinematic-hero"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(105deg, rgba(10,10,11,.97) 0%, rgba(10,10,11,.80) 42%, rgba(10,10,11,.30) 72%, rgba(10,10,11,.10) 100%), url(${heroImage})`
            : undefined,
        }}
      >
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">ANIME OS · COMMUNAUTÉ NEXT-GEN</p>
          <h1 className="hero-title">{heroTitle}</h1>
          <p className="hero-desc">{heroDescription}</p>
          <div className="hero-actions">
            {featuredAnime ? (
              <Link className="primary-btn hero-play-btn" to={ROUTES.WATCH(featuredAnime.id)}>
                ▶ Regarder maintenant
              </Link>
            ) : null}
            {featuredAnime ? (
              <Link className="secondary-btn" to={ROUTES.ANIME_DETAIL(featuredAnime.id)}>
                ℹ Voir les détails
              </Link>
            ) : null}
            <Link className="secondary-btn" to={ROUTES.ADD}>+ Ajouter</Link>
          </div>
        </div>

        {/* Search flottant dans le hero */}
        <div className="hero-search-wrap">
          <input
            className="input-field hero-search"
            placeholder="Rechercher un anime, un genre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher"
          />
          {search && (
            <button
              type="button"
              className="hero-search-clear"
              onClick={() => setSearch('')}
              aria-label="Effacer"
            >×</button>
          )}
        </div>
      </div>

      {/* ── ÉTATS ─────────────────────────────────────────────────── */}
      {animesLoading && !animes.length ? (
        <div className="home-section">
          <div className="section-header-skeleton" />
          <SkeletonRow />
        </div>
      ) : null}

      {animesError ? (
        <div className="surface-panel error-banner">
          <span>⚠️</span>
          <p>Impossible de charger la bibliothèque communautaire.</p>
        </div>
      ) : null}

      {/* ── CONTINUE WATCHING ─────────────────────────────────────── */}
      <ContinueWatchingRow />

      {/* ── TRENDING ANILIST ──────────────────────────────────────── */}
      {trendingLoading ? (
        <div className="home-section">
          <SectionHeader badge="AniList Live" title="Tendances maintenant" subtitle="" />
          <SkeletonRow />
        </div>
      ) : trending.length > 0 ? (
        <section className="home-section">
          <SectionHeader
            badge="AniList Live"
            title="Tendances maintenant"
            subtitle="Les animés qui montent en puissance dans la communauté anime mondiale."
          />
          <div className="anime-row">
            {trending.map((anime, i) => (
              <AnimeSpotlightCard key={anime.id} anime={anime} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── RÉCEMMENT AJOUTÉS (communauté) ───────────────────────── */}
      {recentAnimes.length > 0 ? (
        <section className="home-section">
          <SectionHeader
            badge="Communauté"
            title="Récemment ajoutés"
            subtitle="Les derniers liens anime ajoutés par les membres d'Animelist."
          />
          <div className="anime-row">
            {recentAnimes.map((anime) => (
              <CommunityAnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── POPULAIRES ANILIST ────────────────────────────────────── */}
      {popular.length > 0 ? (
        <section className="home-section">
          <SectionHeader
            badge="Global"
            title="Populaires cette semaine"
            subtitle="Une sélection populaire issue du moteur AniList."
          />
          <div className="anime-row">
            {popular.map((anime, i) => (
              <AnimeSpotlightCard key={anime.id} anime={anime} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── SAISON EN COURS (Jikan) ───────────────────────────────── */}
      {seasonal.length > 0 ? (
        <section className="home-section">
          <SectionHeader
            badge="Saison"
            title="Nouveautés saisonnières"
            subtitle="Les sorties actuelles enrichies via Jikan / MyAnimeList."
          />
          <div className="anime-row">
            {seasonal.map((anime) => (
              <article key={anime.mal_id} className="anime-card anime-tile spotlight-card">
                <div className="spotlight-poster-wrap">
                  <img
                    src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''}
                    alt={anime.title || 'Anime'}
                    loading="lazy"
                  />
                  <div className="spotlight-gradient" />
                  {anime.score ? <span className="score-pill">★ {anime.score}</span> : null}
                </div>
                <div className="spotlight-content">
                  <h3>{anime.title_english || anime.title}</h3>
                  <p>{anime.genres?.slice(0, 3).map((g) => g.name).join(' · ') || 'Saison en cours'}</p>
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

      {/* ── TOP COMMUNAUTÉ ────────────────────────────────────────── */}
      {communityPopular.length > 0 ? (
        <section className="home-section">
          <SectionHeader
            badge="Top communauté"
            title="Populaires sur Animelist"
            subtitle="Les contenus communauté mis en avant dans la bibliothèque."
          />
          <div className="anime-row">
            {communityPopular.map((anime) => (
              <CommunityAnimeCard key={anime.id} anime={anime} compact />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── ACTION ───────────────────────────────────────────────── */}
      {actionAnimes.length > 0 ? (
        <section className="home-section">
          <SectionHeader
            badge="Recommandations"
            title="Parce que tu aimes l'action"
            subtitle="Sélection locale basée sur les genres ajoutés par la communauté."
          />
          <div className="anime-row">
            {actionAnimes.map((anime) => (
              <CommunityAnimeCard key={anime.id} anime={anime} compact />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── CLASSIQUES MAL ───────────────────────────────────────── */}
      {topMal.length > 0 ? (
        <section className="home-section">
          <SectionHeader
            badge="MAL"
            title="Classiques incontournables"
            subtitle="Top anime récupéré via Jikan pour enrichir la découverte."
          />
          <div className="anime-row">
            {topMal.map((anime) => (
              <article key={anime.mal_id} className="anime-card anime-tile spotlight-card">
                <div className="spotlight-poster-wrap">
                  <img
                    src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''}
                    alt={anime.title || 'Anime'}
                    loading="lazy"
                  />
                  <div className="spotlight-gradient" />
                  {anime.score ? <span className="score-pill">★ {anime.score}</span> : null}
                </div>
                <div className="spotlight-content">
                  <h3>{anime.title_english || anime.title}</h3>
                  <p>{anime.studios?.slice(0, 2).map((s) => s.name).join(' · ') || 'Classique anime'}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── EMPTY SEARCH ─────────────────────────────────────────── */}
      {!animesLoading && search && filteredAnimes.length === 0 ? (
        <div className="surface-panel empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2>Aucun résultat pour « {search} »</h2>
          <p>Essaie un autre titre ou un autre genre. Tu peux aussi ajouter cet anime à la communauté.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="secondary-btn" type="button" onClick={() => setSearch('')}>Effacer la recherche</button>
            <Link className="primary-btn" to={ROUTES.ADD}>Ajouter un anime</Link>
          </div>
        </div>
      ) : null}

    </section>
  )
}

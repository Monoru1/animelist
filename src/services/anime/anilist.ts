export type AniListMedia = {
  id: number
  title: {
    romaji?: string | null
    english?: string | null
    native?: string | null
  }
  description?: string | null
  bannerImage?: string | null
  coverImage?: {
    extraLarge?: string | null
    large?: string | null
    color?: string | null
  } | null
  genres?: string[] | null
  averageScore?: number | null
  popularity?: number | null
  trending?: number | null
  episodes?: number | null
  status?: string | null
  season?: string | null
  seasonYear?: number | null
}

const ANILIST_ENDPOINT = 'https://graphql.anilist.co'

async function anilistRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 9000)

  try {
    const response = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(`AniList error ${response.status}`)
    return await response.json() as T
  } finally {
    window.clearTimeout(timeout)
  }
}

const mediaFields = `
  id
  title { romaji english native }
  description(asHtml: false)
  bannerImage
  coverImage { extraLarge large color }
  genres
  averageScore
  popularity
  trending
  episodes
  status
  season
  seasonYear
`

export async function fetchAniListTrending(limit = 12) {
  const query = `
    query Trending($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC) { ${mediaFields} }
      }
    }
  `

  const json = await anilistRequest<{ data?: { Page?: { media?: AniListMedia[] } } }>(query, { page: 1, perPage: limit })
  return json.data?.Page?.media ?? []
}

export async function fetchAniListPopular(limit = 12) {
  const query = `
    query Popular($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC) { ${mediaFields} }
      }
    }
  `

  const json = await anilistRequest<{ data?: { Page?: { media?: AniListMedia[] } } }>(query, { page: 1, perPage: limit })
  return json.data?.Page?.media ?? []
}

export async function searchAniListAnime(search: string, limit = 8) {
  const query = `
    query Search($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, search: $search, sort: SEARCH_MATCH) { ${mediaFields} }
      }
    }
  `

  const json = await anilistRequest<{ data?: { Page?: { media?: AniListMedia[] } } }>(query, { search, perPage: limit })
  return json.data?.Page?.media ?? []
}

export type JikanAnime = {
  mal_id: number
  title?: string
  title_english?: string | null
  title_japanese?: string | null
  synopsis?: string | null
  score?: number | null
  episodes?: number | null
  duration?: string | null
  status?: string | null
  season?: string | null
  year?: number | null
  images?: { jpg?: { image_url?: string; large_image_url?: string } }
  trailer?: { url?: string | null; embed_url?: string | null; youtube_id?: string | null }
  genres?: Array<{ name: string }>
  studios?: Array<{ name: string }>
}

async function jikanGet<T>(path: string): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 9000)

  try {
    const response = await fetch(`https://api.jikan.moe/v4${path}`, { signal: controller.signal })
    if (!response.ok) throw new Error(`Jikan error ${response.status}`)
    return await response.json() as T
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function searchJikanAnime(search: string, limit = 8) {
  const json = await jikanGet<{ data?: JikanAnime[] }>(`/anime?q=${encodeURIComponent(search)}&limit=${limit}`)
  return json.data ?? []
}

export async function fetchJikanTop(limit = 12) {
  const json = await jikanGet<{ data?: JikanAnime[] }>(`/top/anime?limit=${limit}`)
  return json.data ?? []
}

export async function fetchJikanSeasonNow(limit = 12) {
  const json = await jikanGet<{ data?: JikanAnime[] }>(`/seasons/now?limit=${limit}`)
  return json.data ?? []
}

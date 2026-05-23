import type { NormalizedEpisode, NormalizedStreamSource, StreamLanguage, StreamQuality, StreamSourceType } from './types'

export function normalizeLanguage(value?: string | null): StreamLanguage {
  if (!value) return 'VOSTFR'
  if (value.includes('VF/VOSTFR')) return 'VF/VOSTFR'
  if (value.includes('VF')) return 'VF'
  return 'VOSTFR'
}

export function normalizeQuality(value?: string | null): StreamQuality {
  if (!value) return 'HD'
  if (value.includes('1080')) return '1080p'
  if (value.includes('720')) return '720p'
  if (value.includes('SD')) return 'SD'
  return 'HD'
}

export function detectSourceType(url: string): StreamSourceType {
  const lower = url.toLowerCase()
  if (lower.includes('.m3u8')) return 'hls'
  if (lower.includes('.mp4') || lower.includes('.webm')) return 'video'
  if (lower.includes('embed')) return 'iframe'
  return 'external'
}

export function canPlayInApp(url: string) {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function normalizeSource(source: {
  id: string
  label: string
  language: string
  quality: string
  source_url: string
  is_default: boolean
}): NormalizedStreamSource {
  return {
    id: source.id,
    label: source.label,
    language: normalizeLanguage(source.language),
    quality: normalizeQuality(source.quality),
    url: source.source_url,
    type: detectSourceType(source.source_url),
    isDefault: source.is_default,
    isPlayableInApp: canPlayInApp(source.source_url),
  }
}

export function normalizeEpisode(episode: {
  id: string
  season_number: number
  episode_number: number
  title: string | null
  synopsis: string | null
  thumbnail_url: string | null
  episode_sources?: Array<{
    id: string
    label: string
    language: string
    quality: string
    source_url: string
    is_default: boolean
  }> | null
}): NormalizedEpisode {
  return {
    id: episode.id,
    seasonNumber: episode.season_number,
    episodeNumber: episode.episode_number,
    title: episode.title ?? `Épisode ${episode.episode_number}`,
    synopsis: episode.synopsis,
    thumbnailUrl: episode.thumbnail_url,
    sources: (episode.episode_sources ?? []).map(normalizeSource),
  }
}

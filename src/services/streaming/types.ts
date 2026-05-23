export type StreamLanguage = 'VF' | 'VOSTFR' | 'VF/VOSTFR'
export type StreamQuality = 'SD' | '720p' | 'HD' | '1080p'
export type StreamSourceType = 'iframe' | 'video' | 'hls' | 'external'

export type NormalizedStreamSource = {
  id: string
  label: string
  language: StreamLanguage
  quality: StreamQuality
  url: string
  type: StreamSourceType
  isDefault: boolean
  isPlayableInApp: boolean
}

export type NormalizedEpisode = {
  id: string
  seasonNumber: number
  episodeNumber: number
  title: string
  synopsis: string | null
  thumbnailUrl: string | null
  sources: NormalizedStreamSource[]
}

export type WatchProgress = {
  animeId: string
  episodeId?: string | null
  progressSeconds: number
  durationSeconds?: number | null
  completed: boolean
}

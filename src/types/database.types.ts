// ============================================================
// ANIMELIST — Database Types
// Manually maintained to match supabase/schema.sql
// ============================================================

export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  username: string
  email: string
  role: UserRole
  avatar_url: string | null
  banned_until: string | null
  created_at: string
  updated_at: string
}

export interface Anime {
  id: string
  user_id: string
  title: string
  description: string | null
  poster_url: string
  watch_url: string
  genre: string | null
  created_at: string
  updated_at: string
}

export interface Playlist {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface PlaylistItem {
  id: string
  playlist_id: string
  anime_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  reason: string | null
  type: string
  read: boolean
  created_at: string
}

export interface ModerationLog {
  id: string
  admin_id: string | null
  target_user_id: string | null
  target_anime_id: string | null
  action: string
  reason: string
  created_at: string
}

// ============================================================
// Join types used in queries
// ============================================================

export interface AnimeWithAuthor extends Anime {
  profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>
}

export interface PlaylistWithItems extends Playlist {
  playlist_items: Array<PlaylistItem & { animes: Anime }>
}

export interface PlaylistItemWithAnime extends PlaylistItem {
  animes: Anime
}

// ============================================================
// Supabase client Database type
// ============================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
          role?: UserRole
        }
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      animes: {
        Row: Anime
        Insert: Omit<Anime, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Anime, 'id' | 'created_at' | 'updated_at'>>
      }
      playlists: {
        Row: Playlist
        Insert: Omit<Playlist, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Playlist, 'id' | 'created_at' | 'updated_at'>>
      }
      playlist_items: {
        Row: PlaylistItem
        Insert: Omit<PlaylistItem, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<PlaylistItem, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          type?: string
          read?: boolean
        }
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
      moderation_logs: {
        Row: ModerationLog
        Insert: Omit<ModerationLog, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: never
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}

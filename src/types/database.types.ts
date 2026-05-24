export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      animes: {
        Row: { id: string; user_id: string; title: string; description: string | null; poster_url: string; watch_url: string | null; genre: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; description?: string | null; poster_url: string; watch_url?: string | null; genre?: string | null }
        Update: { title?: string; description?: string | null; poster_url?: string; watch_url?: string | null; genre?: string | null }
      }
      profiles: {
        Row: { id: string; username: string; email: string; role: string; avatar_url: string | null; created_at: string; updated_at: string }
        Insert: { id: string; username: string; email: string; role?: string; avatar_url?: string | null }
        Update: { username?: string; email?: string; role?: string; avatar_url?: string | null }
      }
      notifications: {
        Row: { id: string; user_id: string; title: string; message: string; reason: string | null; type: string; read: boolean; target_type: string; created_by: string | null; expires_at: string | null; created_at: string }
        Insert: { id?: string; user_id: string; title: string; message: string; reason?: string | null; type?: string; read?: boolean; target_type?: string; created_by?: string | null }
        Update: { read?: boolean; type?: string }
      }
      favorites: {
        Row: { id: string; user_id: string; anime_id: string; created_at: string }
        Insert: { id?: string; user_id: string; anime_id: string }
        Update: Record<string, never>
      }
      anime_episodes: {
        Row: { id: string; anime_id: string; season_number: number; episode_number: number; title: string | null; synopsis: string | null; thumbnail_url: string | null; duration_seconds: number | null; created_at: string; updated_at: string }
        Insert: { id?: string; anime_id: string; season_number?: number; episode_number: number; title?: string | null; synopsis?: string | null; thumbnail_url?: string | null }
        Update: { title?: string | null; synopsis?: string | null; thumbnail_url?: string | null }
      }
      episode_sources: {
        Row: { id: string; episode_id: string; label: string; language: string; quality: string; source_url: string; source_type: string; is_default: boolean; is_active: boolean; created_by: string | null; created_at: string }
        Insert: { id?: string; episode_id: string; label: string; language?: string; quality?: string; source_url: string; source_type?: string; is_default?: boolean; is_active?: boolean; created_by?: string | null }
        Update: { is_active?: boolean; is_default?: boolean; source_url?: string }
      }
      watch_history: {
        Row: { id: string; user_id: string; anime_id: string; progress_seconds: number; last_watched_at: string; created_at: string }
        Insert: { id?: string; user_id: string; anime_id: string; progress_seconds?: number; last_watched_at?: string }
        Update: { progress_seconds?: number; last_watched_at?: string }
      }
      watch_progress: {
        Row: { id: string; user_id: string; anime_id: string; episode_id: string | null; progress_seconds: number; duration_seconds: number | null; completed: boolean; updated_at: string }
        Insert: { id?: string; user_id: string; anime_id: string; episode_id?: string | null; progress_seconds?: number; completed?: boolean }
        Update: { progress_seconds?: number; completed?: boolean; episode_id?: string | null; updated_at?: string }
      }
      watch_chat_messages: {
        Row: { id: string; anime_id: string; episode_id: string | null; user_id: string; username: string; message: string; is_deleted: boolean; deleted_at: string | null; created_at: string }
        Insert: { id?: string; anime_id: string; episode_id?: string | null; user_id: string; username: string; message: string }
        Update: { is_deleted?: boolean; deleted_at?: string | null }
      }
      source_reports: {
        Row: { id: string; source_id: string | null; anime_id: string | null; episode_id: string | null; reported_by: string | null; user_id: string | null; reason: string; status: string; created_at: string }
        Insert: { source_id?: string | null; anime_id?: string | null; episode_id?: string | null; reported_by?: string | null; reason?: string }
        Update: { status?: string }
      }
      playlists: {
        Row: { id: string; user_id: string; name: string; description: string | null; is_public: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; description?: string | null; is_public?: boolean }
        Update: { name?: string; description?: string | null; is_public?: boolean }
      }
      moderation_logs: {
        Row: { id: string; admin_id: string | null; target_user_id: string | null; target_anime_id: string | null; action: string; reason: string; created_at: string }
        Insert: { admin_id?: string | null; target_user_id?: string | null; target_anime_id?: string | null; action: string; reason: string }
        Update: Record<string, never>
      }
    }
    Views: Record<string, never>
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile          = Database['public']['Tables']['profiles']['Row']
export type Anime            = Database['public']['Tables']['animes']['Row']
export type Notification     = Database['public']['Tables']['notifications']['Row']
export type Playlist         = Database['public']['Tables']['playlists']['Row']
export type AnimeEpisode     = Database['public']['Tables']['anime_episodes']['Row']
export type EpisodeSource    = Database['public']['Tables']['episode_sources']['Row']
export type WatchChatMessage = Database['public']['Tables']['watch_chat_messages']['Row']
export type UserRole = 'user' | 'admin'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      animes: {
        Row: { id: string; user_id: string; title: string; description: string | null; poster_url: string; watch_url: string; genre: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; description?: string | null; poster_url: string; watch_url: string; genre?: string | null; created_at?: string; updated_at?: string }
        Update: { title?: string; description?: string | null; poster_url?: string; watch_url?: string; genre?: string | null; updated_at?: string }
      }
      profiles: {
        Row: { id: string; username: string; email: string; role: string; avatar_url: string | null; created_at: string; updated_at: string }
        Insert: { id: string; username: string; email: string; role?: string; avatar_url?: string | null; created_at?: string; updated_at?: string }
        Update: { username?: string; email?: string; role?: string; avatar_url?: string | null; updated_at?: string }
      }
      notifications: {
        Row: { id: string; user_id: string; title: string; message: string; reason: string | null; type: string; read: boolean; created_at: string }
        Insert: { id?: string; user_id: string; title: string; message: string; reason?: string | null; type?: string; read?: boolean; created_at?: string }
        Update: { title?: string; message?: string; reason?: string | null; type?: string; read?: boolean }
      }
      playlists: {
        Row: { id: string; user_id: string; name: string; description: string | null; is_public: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; description?: string | null; is_public?: boolean; created_at?: string; updated_at?: string }
        Update: { name?: string; description?: string | null; is_public?: boolean; updated_at?: string }
      }
      playlist_items: {
        Row: { id: string; playlist_id: string; anime_id: string; created_at: string }
        Insert: { id?: string; playlist_id: string; anime_id: string; created_at?: string }
        Update: { playlist_id?: string; anime_id?: string }
      }
      moderation_logs: {
        Row: { id: string; admin_id: string | null; target_user_id: string | null; target_anime_id: string | null; action: string; reason: string; created_at: string }
        Insert: { id?: string; admin_id?: string | null; target_user_id?: string | null; target_anime_id?: string | null; action: string; reason: string; created_at?: string }
        Update: { action?: string; reason?: string }
      }
    }
    Views: Record<string, never>
    Functions: { is_admin: { Args: never; Returns: boolean } }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Anime = Database['public']['Tables']['animes']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Playlist = Database['public']['Tables']['playlists']['Row']
export type UserRole = 'user' | 'admin'

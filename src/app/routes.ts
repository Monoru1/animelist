// Routes constants — ne jamais utiliser des magic strings pour les routes
export const ROUTES = {
  HOME: '/library',
  LIBRARY: '/library',
  ANIME_DETAIL: (id: string) => `/anime/${id}`,
  WATCH: (id: string) => `/watch/${id}`,
  HISTORY: '/history',
  FAVORITES: '/favorites',
  ADD: '/add',
  PLAYLIST: '/my-playlist',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  ADMIN: '/admin',
  LOGIN: '/login',
  REGISTER: '/register',
} as const

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AddAnimePage } from '@/pages/AddAnimePage'
import { AdminPage } from '@/pages/AdminPage'
import { AnimeDetailPage } from '@/pages/AnimeDetailPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { LoginPage } from '@/pages/LoginPage'
import { MyPlaylistPage } from '@/pages/MyPlaylistPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'
import { WatchHistoryPage } from '@/pages/WatchHistoryPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/library" replace />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="anime/:animeId" element={<AnimeDetailPage />} />
          <Route path="history" element={<WatchHistoryPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="add" element={<AddAnimePage />} />
          <Route path="my-playlist" element={<MyPlaylistPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/library" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

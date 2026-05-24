import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

const mainLinks = [
  { to: '/library', label: 'Accueil', icon: '⌂' },
  { to: '/history', label: 'Continuer', icon: '▶' },
  { to: '/favorites', label: 'Favoris', icon: '♡' },
  { to: '/add', label: 'Ajouter', icon: '+' },
  { to: '/profile', label: 'Profil', icon: '◉' },
]

const drawerLinks = [
  { to: '/library', label: 'Accueil' },
  { to: '/history', label: 'Continuer à regarder' },
  { to: '/favorites', label: 'Favoris' },
  { to: '/add', label: 'Ajouter un anime' },
  { to: '/my-playlist', label: 'Ma playlist' },
  { to: '/profile', label: 'Profil' },
  { to: '/notifications', label: 'Notifications' },
]

export function AppLayout() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function loadUserState() {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id
      if (!userId) return

      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
      setIsAdmin(data?.role === 'admin')

      const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('read_at', null)
      setUnreadCount(count ?? 0)
    }

    void loadUserState()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/library" className="topbar-logo" onClick={closeDrawer}>Animelist</NavLink>
        <nav className="topbar-nav" aria-label="Navigation principale">
          <NavLink to="/library" className={({ isActive }) => isActive ? 'topbar-link active' : 'topbar-link'}>Accueil</NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'topbar-link active' : 'topbar-link'}>Continuer</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => isActive ? 'topbar-link active' : 'topbar-link'}>Favoris</NavLink>
          <NavLink to="/my-playlist" className={({ isActive }) => isActive ? 'topbar-link active' : 'topbar-link'}>Playlist</NavLink>
          {isAdmin ? <NavLink to="/admin" className={({ isActive }) => isActive ? 'topbar-link active' : 'topbar-link'}>Admin</NavLink> : null}
        </nav>
        <div className="topbar-actions">
          <NavLink to="/notifications" className="icon-btn" aria-label="Notifications">
            🔔{unreadCount > 0 ? <span className="notification-dot">{unreadCount}</span> : null}
          </NavLink>
          <NavLink to="/profile" className="icon-btn" aria-label="Profil">◉</NavLink>
          <button type="button" className="icon-btn hamburger-btn" aria-label="Menu" onClick={() => setIsDrawerOpen(true)}>☰</button>
          <button type="button" className="secondary-btn desktop-signout" onClick={() => void signOut()}>Déconnexion</button>
        </div>
      </header>

      {isDrawerOpen ? (
        <div className="drawer-backdrop" role="presentation" onClick={closeDrawer}>
          <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu mobile" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <p className="eyebrow">ANIME OS</p>
                <h2>Animelist</h2>
              </div>
              <button type="button" className="icon-btn" onClick={closeDrawer}>×</button>
            </div>
            <nav className="drawer-nav">
              {drawerLinks.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={closeDrawer} className={({ isActive }) => isActive ? 'drawer-link active' : 'drawer-link'}>
                  {link.label}
                </NavLink>
              ))}
              {isAdmin ? <NavLink to="/admin" onClick={closeDrawer} className={({ isActive }) => isActive ? 'drawer-link active' : 'drawer-link'}>Administration</NavLink> : null}
            </nav>
            <button type="button" className="secondary-btn drawer-signout" onClick={() => void signOut()}>Déconnexion</button>
          </aside>
        </div>
      ) : null}

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Navigation mobile">
        {mainLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
            <span>{link.icon}</span>
            <small>{link.label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

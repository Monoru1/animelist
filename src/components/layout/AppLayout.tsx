import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications'
import { ROUTES } from '@/app/routes'

const mainLinks = [
  { to: ROUTES.LIBRARY, label: 'Accueil', icon: '⌂' },
  { to: ROUTES.HISTORY, label: 'Continuer', icon: '▶' },
  { to: ROUTES.FAVORITES, label: 'Favoris', icon: '♡' },
  { to: ROUTES.ADD, label: 'Ajouter', icon: '+' },
  { to: ROUTES.PROFILE, label: 'Profil', icon: '◉' },
]

const drawerLinks = [
  { to: ROUTES.LIBRARY, label: 'Accueil' },
  { to: ROUTES.HISTORY, label: 'Continuer à regarder' },
  { to: ROUTES.FAVORITES, label: 'Favoris' },
  { to: ROUTES.ADD, label: 'Ajouter un anime' },
  { to: ROUTES.PLAYLIST, label: 'Ma playlist' },
  { to: ROUTES.PROFILE, label: 'Profil' },
  { to: ROUTES.NOTIFICATIONS, label: 'Notifications' },
]

export function AppLayout() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadCount()

  useEffect(() => {
    async function loadUserState() {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id
      if (!userId) return
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
      setIsAdmin(data?.role === 'admin')
    }
    void loadUserState()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    navigate(ROUTES.LOGIN)
  }

  function closeDrawer() { setIsDrawerOpen(false) }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to={ROUTES.LIBRARY} className="topbar-logo" onClick={closeDrawer}>Animelist</NavLink>

        <nav className="topbar-nav" aria-label="Navigation principale">
          <NavLink to={ROUTES.LIBRARY} className={({ isActive }) => isActive ? 'topbar-link active' : 'topbar-link'}>Accueil</NavLink>
          <NavLink to={ROUTES.HISTORY} className={({ isActive }) => isActive ? 'topbar-link active' : 'topbar-link'}>Continuer</NavLink>
          <NavLink to={ROUTES.FAVORITES} className={({ isActive }) => isActive ? 'topbar-link active' : 'topbar-link'}>Favoris</NavLink>
          <NavLink to={ROUTES.PLAYLIST} className={({ isActive }) => isActive ? 'topbar-link active' : 'topbar-link'}>Playlist</NavLink>
          {isAdmin ? (
            <NavLink to={ROUTES.ADMIN} className={({ isActive }) => isActive ? 'topbar-link active topbar-link--admin' : 'topbar-link topbar-link--admin'}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="topbar-actions">
          <NavLink to={ROUTES.NOTIFICATIONS} className="icon-btn" aria-label="Notifications">
            🔔
            {unreadCount > 0 ? (
              <span className="notification-dot">{unreadCount > 99 ? '99+' : unreadCount}</span>
            ) : null}
          </NavLink>
          <NavLink to={ROUTES.PROFILE} className="icon-btn" aria-label="Profil">◉</NavLink>
          <button
            type="button"
            className="icon-btn hamburger-btn"
            aria-label="Menu"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
          >☰</button>
          <button type="button" className="secondary-btn desktop-signout" onClick={() => void signOut()}>
            Déconnexion
          </button>
        </div>
      </header>

      {isDrawerOpen ? (
        <div className="drawer-backdrop" role="presentation" onClick={closeDrawer}>
          <aside
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu mobile"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-head">
              <div>
                <p className="eyebrow">ANIME OS</p>
                <h2>Animelist</h2>
              </div>
              <button type="button" className="icon-btn" onClick={closeDrawer} aria-label="Fermer">×</button>
            </div>
            <nav className="drawer-nav">
              {drawerLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeDrawer}
                  className={({ isActive }) => isActive ? 'drawer-link active' : 'drawer-link'}
                >
                  {link.label}
                  {link.to === ROUTES.NOTIFICATIONS && unreadCount > 0 ? (
                    <span className="notification-dot" style={{ position: 'static', marginLeft: 'auto' }}>{unreadCount}</span>
                  ) : null}
                </NavLink>
              ))}
              {isAdmin ? (
                <NavLink
                  to={ROUTES.ADMIN}
                  onClick={closeDrawer}
                  className={({ isActive }) => isActive ? 'drawer-link active' : 'drawer-link'}
                >
                  Administration
                </NavLink>
              ) : null}
            </nav>
            <button type="button" className="secondary-btn drawer-signout" onClick={() => void signOut()}>
              Déconnexion
            </button>
          </aside>
        </div>
      ) : null}

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Navigation mobile">
        {mainLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'}
          >
            <span>{link.icon}</span>
            <small>{link.label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

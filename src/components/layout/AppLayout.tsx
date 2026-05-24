import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications'
import { ROUTES } from '@/app/routes'

// ── Bottom nav : navigation rapide principale ──────────────────────
const BOTTOM_LINKS = [
  { to: ROUTES.LIBRARY,   label: 'Accueil',   icon: '⌂' },
  { to: ROUTES.HISTORY,   label: 'Continuer', icon: '▶' },
  { to: ROUTES.FAVORITES, label: 'Favoris',   icon: '♡' },
  { to: ROUTES.ADD,       label: 'Ajouter',   icon: '+' },
  { to: ROUTES.PROFILE,   label: 'Profil',    icon: '◉' },
]

// ── Drawer : navigation secondaire + settings ─────────────────────
const DRAWER_LINKS = [
  { to: ROUTES.PLAYLIST,      label: 'Ma playlist',          icon: '▤' },
  { to: ROUTES.NOTIFICATIONS, label: 'Notifications',        icon: '🔔' },
]
const DRAWER_ADMIN_LINK = { to: ROUTES.ADMIN, label: 'Administration', icon: '⚙' }

export function AppLayout() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin]         = useState(false)
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const { data: unreadCount = 0 }     = useUnreadCount()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Charger le rôle admin
  useEffect(() => {
    supabase.auth.getUser().then(({ data: authData }) => {
      const userId = authData.user?.id
      if (!userId) return
      supabase.from('profiles').select('role').eq('id', userId).single().then(({ data }) => {
        setIsAdmin(data?.role === 'admin')
      })
    })
  }, [])

  // Body scroll lock quand drawer ouvert
  useEffect(() => {
    if (drawerOpen) {
      const scrollY = window.scrollY
      document.body.style.position   = 'fixed'
      document.body.style.top        = `-${scrollY}px`
      document.body.style.left       = '0'
      document.body.style.right      = '0'
      document.body.style.overflowY  = 'scroll'
    } else {
      const scrollY = parseInt(document.body.style.top || '0') * -1
      document.body.style.position  = ''
      document.body.style.top       = ''
      document.body.style.left      = ''
      document.body.style.right     = ''
      document.body.style.overflowY = ''
      window.scrollTo(0, scrollY)
    }
    return () => {
      document.body.style.position  = ''
      document.body.style.top       = ''
      document.body.style.left      = ''
      document.body.style.right     = ''
      document.body.style.overflowY = ''
    }
  }, [drawerOpen])

  // Fermer drawer avec Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function closeDrawer() { setDrawerOpen(false) }

  async function signOut() {
    closeDrawer()
    await supabase.auth.signOut()
    navigate(ROUTES.LOGIN)
  }

  // ── Drawer markup — rendu dans un portal pour sortir du flow DOM ──
  const drawerPortal = drawerOpen ? createPortal(
    <div
      className="drawer-overlay"
      role="presentation"
      onClick={closeDrawer}
      aria-hidden="true"
    >
      <aside
        ref={drawerRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <p className="eyebrow" style={{ margin: 0, fontSize: 11 }}>ANIME OS</p>
            <span className="drawer-brand-name">Animelist</span>
          </div>
          <button
            type="button"
            className="drawer-close"
            onClick={closeDrawer}
            aria-label="Fermer le menu"
          >×</button>
        </div>

        {/* Liens */}
        <nav className="drawer-nav" aria-label="Menu principal">
          {DRAWER_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeDrawer}
              className={({ isActive }) => `drawer-link${isActive ? ' drawer-link--active' : ''}`}
            >
              <span className="drawer-link-icon">{link.icon}</span>
              <span>{link.label}</span>
              {link.to === ROUTES.NOTIFICATIONS && unreadCount > 0 ? (
                <span className="drawer-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              ) : null}
            </NavLink>
          ))}

          {isAdmin ? (
            <NavLink
              to={DRAWER_ADMIN_LINK.to}
              onClick={closeDrawer}
              className={({ isActive }) => `drawer-link drawer-link--admin${isActive ? ' drawer-link--active' : ''}`}
            >
              <span className="drawer-link-icon">{DRAWER_ADMIN_LINK.icon}</span>
              <span>{DRAWER_ADMIN_LINK.label}</span>
            </NavLink>
          ) : null}
        </nav>

        {/* Séparateur + déconnexion sticky en bas */}
        <div className="drawer-footer">
          <div className="drawer-divider" />
          <button
            type="button"
            className="drawer-signout"
            onClick={() => void signOut()}
          >
            <span>⏻</span>
            Déconnexion
          </button>
        </div>
      </aside>
    </div>,
    document.body
  ) : null

  return (
    <div className="app-shell">

      {/* ── Topbar ─────────────────────────────────────────────── */}
      <header className="topbar">
        <NavLink to={ROUTES.LIBRARY} className="topbar-logo">Animelist</NavLink>

        {/* Desktop nav */}
        <nav className="topbar-nav" aria-label="Navigation principale">
          <NavLink to={ROUTES.LIBRARY}    className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}>Accueil</NavLink>
          <NavLink to={ROUTES.HISTORY}    className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}>Continuer</NavLink>
          <NavLink to={ROUTES.FAVORITES}  className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}>Favoris</NavLink>
          <NavLink to={ROUTES.PLAYLIST}   className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}>Playlist</NavLink>
          {isAdmin ? (
            <NavLink to={ROUTES.ADMIN} className={({ isActive }) => `topbar-link topbar-link--admin${isActive ? ' active' : ''}`}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        {/* Actions */}
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
            aria-label="Ouvrir le menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(true)}
          >☰</button>
          <button
            type="button"
            className="secondary-btn desktop-signout"
            onClick={() => void signOut()}
          >Déconnexion</button>
        </div>
      </header>

      {/* Portal drawer — hors du flow DOM normal */}
      {drawerPortal}

      {/* ── Contenu principal ──────────────────────────────────── */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* ── Bottom nav mobile ──────────────────────────────────── */}
      <nav className="bottom-nav" aria-label="Navigation mobile">
        {BOTTOM_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}
          >
            <span aria-hidden="true">{link.icon}</span>
            <small>{link.label}</small>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}

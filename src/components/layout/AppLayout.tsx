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

export function AppLayout() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function loadRole() {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id
      if (!userId) return

      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
      setIsAdmin(data?.role === 'admin')
    }

    void loadRole()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <h1>Animelist</h1>
          <p>Anime OS communautaire.</p>
        </div>

        <nav className="desktop-nav">
          <NavLink to="/library" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Accueil</NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Continuer</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Favoris</NavLink>
          <NavLink to="/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Ajouter</NavLink>
          <NavLink to="/my-playlist" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Ma playlist</NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Profil</NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Notifications</NavLink>
          {isAdmin ? <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink> : null}
        </nav>

        <button type="button" className="secondary-btn signout-btn" onClick={() => void signOut()}>
          Déconnexion
        </button>
      </aside>

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

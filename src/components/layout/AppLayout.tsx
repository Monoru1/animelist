import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

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
        <h1 style={{ margin: 0, fontSize: 34 }}>Animelist</h1>
        <p style={{ marginTop: 10, marginBottom: 30, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Plateforme communautaire anime & playlists.
        </p>

        <nav style={{ display: 'grid', gap: 10 }}>
          <NavLink to="/library" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Bibliothèque</NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Continuer</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Favoris</NavLink>
          <NavLink to="/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Ajouter</NavLink>
          <NavLink to="/my-playlist" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Ma playlist</NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Profil</NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Notifications</NavLink>
          {isAdmin ? <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink> : null}
        </nav>

        <button type="button" className="secondary-btn" onClick={() => void signOut()} style={{ position: 'absolute', left: 24, right: 24, bottom: 24 }}>
          Déconnexion
        </button>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

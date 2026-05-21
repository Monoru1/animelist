import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

const linkBase = {
  display: 'block',
  padding: '12px 14px',
  borderRadius: 14,
  textDecoration: 'none',
  fontWeight: 700,
}

export function AppLayout() {
  const navigate = useNavigate()

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top left, rgba(124, 92, 255, 0.18), transparent 32%), var(--color-bg)', color: 'var(--color-text)' }}>
      <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 270, padding: 24, background: 'rgba(19, 19, 26, 0.92)', borderRight: '1px solid var(--color-border)', backdropFilter: 'blur(16px)' }}>
        <h1 style={{ margin: 0, fontSize: 30 }}>Animelist</h1>
        <p style={{ marginTop: 8, marginBottom: 30, color: 'var(--color-text-muted)' }}>Anime library communautaire</p>

        <nav style={{ display: 'grid', gap: 10 }}>
          <NavLink to="/library" style={({ isActive }) => ({ ...linkBase, color: isActive ? 'white' : 'var(--color-text-muted)', background: isActive ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hi))' : 'transparent' })}>Bibliothèque</NavLink>
          <NavLink to="/add" style={({ isActive }) => ({ ...linkBase, color: isActive ? 'white' : 'var(--color-text-muted)', background: isActive ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hi))' : 'transparent' })}>Ajouter</NavLink>
          <NavLink to="/my-playlist" style={({ isActive }) => ({ ...linkBase, color: isActive ? 'white' : 'var(--color-text-muted)', background: isActive ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hi))' : 'transparent' })}>Ma playlist</NavLink>
          <NavLink to="/notifications" style={({ isActive }) => ({ ...linkBase, color: isActive ? 'white' : 'var(--color-text-muted)', background: isActive ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hi))' : 'transparent' })}>Notifications</NavLink>
          <NavLink to="/admin" style={({ isActive }) => ({ ...linkBase, color: isActive ? 'white' : 'var(--color-text-muted)', background: isActive ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hi))' : 'transparent' })}>Admin</NavLink>
        </nav>

        <button type="button" onClick={() => void signOut()} style={{ position: 'absolute', left: 24, right: 24, bottom: 24, padding: 12, borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', cursor: 'pointer' }}>
          Déconnexion
        </button>
      </aside>

      <main style={{ marginLeft: 270, padding: 32 }}>
        <Outlet />
      </main>
    </div>
  )
}

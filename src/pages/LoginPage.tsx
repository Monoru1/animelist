import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    setLoading(false)

    if (error) {
      setErrorMessage('Email ou mot de passe incorrect.')
      return
    }

    navigate('/library')
  }

  return (
    <main className="app-shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <section className="surface-panel" style={{ width: 'min(980px, 96vw)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div style={{ display: 'grid', alignContent: 'center' }}>
          <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>ANIMELIST</p>
          <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.8rem)', lineHeight: 1, margin: '14px 0' }}>Retrouve ta bibliothèque.</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 18, lineHeight: 1.6 }}>
            Connecte-toi pour ajouter des animés, suivre tes playlists et explorer les liens partagés par la communauté.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, alignContent: 'center' }}>
          <label>Email</label>
          <input className="input-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="toi@email.com" />

          <label>Mot de passe</label>
          <input className="input-field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Ton mot de passe" />

          {errorMessage ? <p style={{ color: '#ff6b6b' }}>{errorMessage}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Pas encore de compte ? <Link to="/register" style={{ color: 'var(--color-accent-hi)', fontWeight: 800 }}>Créer un compte</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

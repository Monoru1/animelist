import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    navigate('/library')
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <form onSubmit={handleSubmit} style={{ width: 'min(420px, 92vw)', padding: 28, border: '1px solid var(--color-border)', borderRadius: 24, background: 'var(--color-surface)' }}>
        <h1>Connexion</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Connecte-toi pour accéder à la bibliothèque.</p>
        <label>Email</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ width: '100%', margin: '8px 0 16px', padding: 12 }} />
        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ width: '100%', margin: '8px 0 16px', padding: 12 }} />
        {errorMessage ? <p style={{ color: '#ff6b6b' }}>{errorMessage}</p> : null}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  )
}

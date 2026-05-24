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
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-hero">
          <p className="eyebrow">ANIMELIST</p>
          <h1>Reprends ton anime.</h1>
          <p>Connecte-toi pour retrouver ta watchlist, tes favoris, ton historique et continuer là où tu t’étais arrêté.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input className="input-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="toi@email.com" />

          <label>Mot de passe</label>
          <input className="input-field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Ton mot de passe" />

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>

          <p className="auth-switch">Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
        </form>
      </section>
    </main>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const cleanUsername = username.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (cleanUsername.length < 3) {
      setLoading(false)
      setErrorMessage('Le pseudo doit contenir au moins 3 caractères.')
      return
    }

    if (password.length < 6) {
      setLoading(false)
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setLoading(false)
      setErrorMessage('Les mots de passe ne correspondent pas.')
      return
    }

    const [{ data: existingPseudo }, { data: existingEmail }] = await Promise.all([
      supabase.from('profiles').select('id').eq('username', cleanUsername).maybeSingle(),
      supabase.from('profiles').select('id').eq('email', cleanEmail).maybeSingle(),
    ])

    if (existingPseudo) {
      setLoading(false)
      setErrorMessage('Ce pseudo est déjà utilisé.')
      return
    }

    if (existingEmail) {
      setLoading(false)
      setErrorMessage('Cet email est déjà utilisé.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { username: cleanUsername } },
    })

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    navigate('/library')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-hero">
          <p className="eyebrow">REJOINDRE ANIMELIST</p>
          <h1>Construis ton univers anime.</h1>
          <p>Crée ton compte pour suivre tes épisodes, sauvegarder tes playlists et partager tes découvertes avec la communauté.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Pseudo</label>
          <input className="input-field" value={username} onChange={(event) => setUsername(event.target.value)} required placeholder="ex: Ryad" />

          <label>Email</label>
          <input className="input-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="toi@email.com" />

          <label>Mot de passe</label>
          <input className="input-field" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="6 caractères minimum" />

          <label>Confirmer le mot de passe</label>
          <input className="input-field" type="password" minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required placeholder="Retape ton mot de passe" />

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer mon compte'}</button>

          <p className="auth-switch">Déjà un compte ? <Link to="/login">Connexion</Link></p>
        </form>
      </section>
    </main>
  )
}

import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const cleanUsername = username.trim()

    if (cleanUsername.length < 3) {
      setLoading(false)
      setErrorMessage('Le pseudo doit contenir au moins 3 caractères.')
      return
    }

    const { data: existingPseudo } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (existingPseudo) {
      setLoading(false)
      setErrorMessage('Ce pseudo est déjà utilisé.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
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
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <form onSubmit={handleSubmit} style={{ width: 'min(420px, 92vw)', padding: 28, border: '1px solid var(--color-border)', borderRadius: 24, background: 'var(--color-surface)' }}>
        <h1>Inscription</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Crée ton compte et ajoute tes animés.</p>

        <label>Pseudo</label>
        <input value={username} onChange={(event) => setUsername(event.target.value)} required style={{ width: '100%', margin: '8px 0 16px', padding: 12 }} />

        <label>Email</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ width: '100%', margin: '8px 0 16px', padding: 12 }} />

        <label>Mot de passe</label>
        <input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required style={{ width: '100%', margin: '8px 0 16px', padding: 12 }} />

        {errorMessage ? <p style={{ color: '#ff6b6b' }}>{errorMessage}</p> : null}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>
    </main>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

// ---------------------------------------------------------------------------
// Règles de validation mot de passe
// ---------------------------------------------------------------------------
interface PasswordStrength {
  score: number       // 0–4
  label: string
  color: string
  rules: {
    label: string
    ok: boolean
  }[]
}

function checkPasswordStrength(pwd: string): PasswordStrength {
  const rules = [
    { label: '8 caractères minimum', ok: pwd.length >= 8 },
    { label: 'Une majuscule', ok: /[A-Z]/.test(pwd) },
    { label: 'Une minuscule', ok: /[a-z]/.test(pwd) },
    { label: 'Un chiffre', ok: /[0-9]/.test(pwd) },
    { label: 'Un caractère spécial (!@#$…)', ok: /[^A-Za-z0-9]/.test(pwd) },
  ]

  const score = rules.filter((r) => r.ok).length

  const label = score <= 1 ? 'Très faible' : score === 2 ? 'Faible' : score === 3 ? 'Moyen' : score === 4 ? 'Fort' : 'Très fort'
  const color = score <= 1 ? '#ef4444' : score === 2 ? '#f97316' : score === 3 ? '#eab308' : score === 4 ? '#22c55e' : '#10b981'

  return { score, label, color, rules }
}

function isPasswordValid(pwd: string) {
  const s = checkPasswordStrength(pwd)
  return s.rules.every((r) => r.ok)
}

// ---------------------------------------------------------------------------

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordRules, setShowPasswordRules] = useState(false)

  const strength = password ? checkPasswordStrength(password) : null
  const passwordValid = password ? isPasswordValid(password) : false
  const formValid =
    username.trim().length >= 3 &&
    username.trim().length <= 20 &&
    email.trim().length > 0 &&
    passwordValid &&
    confirmPassword === password

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formValid) return

    setLoading(true)
    setErrorMessage('')

    const cleanUsername = username.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      setLoading(false)
      setErrorMessage('Le pseudo doit faire entre 3 et 20 caractères.')
      return
    }

    if (!isPasswordValid(password)) {
      setLoading(false)
      setErrorMessage('Le mot de passe ne respecte pas les critères de sécurité.')
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
          <input
            className="input-field"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            minLength={3}
            maxLength={20}
            placeholder="3 à 20 caractères"
          />
          {username && (username.trim().length < 3 || username.trim().length > 20) ? (
            <p className="form-hint form-hint--error">3 à 20 caractères requis.</p>
          ) : null}

          <label>Email</label>
          <input
            className="input-field"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="toi@email.com"
          />

          <label>Mot de passe</label>
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onFocus={() => setShowPasswordRules(true)}
            required
            placeholder="8 caractères minimum"
          />

          {/* Barre de force */}
          {strength ? (
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: i <= strength.score ? strength.color : 'var(--color-surface-hi)',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
              <p style={{ color: strength.color, fontSize: '0.75rem', margin: 0 }}>
                {strength.label}
              </p>
            </div>
          ) : null}

          {/* Règles détaillées */}
          {showPasswordRules && strength ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
              {strength.rules.map((rule) => (
                <li key={rule.label} style={{ fontSize: '0.78rem', color: rule.ok ? '#4ade80' : 'var(--color-text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>{rule.ok ? '✓' : '○'}</span>
                  {rule.label}
                </li>
              ))}
            </ul>
          ) : null}

          <label>Confirmer le mot de passe</label>
          <input
            className="input-field"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            placeholder="Retape ton mot de passe"
          />
          {confirmPassword && confirmPassword !== password ? (
            <p className="form-hint form-hint--error">Les mots de passe ne correspondent pas.</p>
          ) : confirmPassword && confirmPassword === password ? (
            <p className="form-hint form-hint--success">✓ Mots de passe identiques</p>
          ) : null}

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading || !formValid}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>

          <p className="auth-switch">Déjà un compte ? <Link to="/login">Connexion</Link></p>
        </form>
      </section>
    </main>
  )
}

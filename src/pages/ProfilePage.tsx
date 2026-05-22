import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabaseClient'

type Profile = {
  id: string
  username: string
  email: string
  role: string
  avatar_url: string | null
}

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id
      if (!userId) return

      const { data } = await supabase.from('profiles').select('id,username,email,role,avatar_url').eq('id', userId).single()
      if (data) {
        const nextProfile = data as Profile
        setProfile(nextProfile)
        setUsername(nextProfile.username ?? '')
        setAvatarUrl(nextProfile.avatar_url ?? '')
      }
    }

    void loadProfile()
  }, [])

  async function saveProfile() {
    if (!profile) return
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim(), avatar_url: avatarUrl.trim() || null })
      .eq('id', profile.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Profil mis à jour.')
  }

  return (
    <main>
      <div className="surface-panel" style={{ maxWidth: 760 }}>
        <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>ESPACE UTILISATEUR</p>
        <h1 style={{ marginTop: 10 }}>Mon profil</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Gère ton pseudo, ton avatar et ton identité visible sur Animelist.</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '24px 0', flexWrap: 'wrap' }}>
          <img
            src={avatarUrl || 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=animelist'}
            alt="Avatar"
            style={{ width: 96, height: 96, borderRadius: 24, objectFit: 'cover', background: 'var(--color-surface-hi)' }}
          />
          <div>
            <strong>{profile?.email}</strong>
            <p style={{ color: 'var(--color-text-muted)', margin: '6px 0 0' }}>Rôle : {profile?.role ?? 'user'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <label>Pseudo</label>
          <input className="input-field" value={username} onChange={(event) => setUsername(event.target.value)} />

          <label>URL avatar</label>
          <input className="input-field" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." />

          <button className="primary-btn" type="button" onClick={() => void saveProfile()}>
            Sauvegarder
          </button>
        </div>

        {message ? <p>{message}</p> : null}
      </div>
    </main>
  )
}

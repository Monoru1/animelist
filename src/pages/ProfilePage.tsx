import { useState } from 'react'
import { useCurrentProfile, useUpdateProfile } from '@/features/profile/hooks/useProfile'

export function ProfilePage() {
  const { data: profile, isLoading } = useCurrentProfile()
  const updateProfile = useUpdateProfile()
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [message, setMessage] = useState('')
  const [initialized, setInitialized] = useState(false)

  if (profile && !initialized) {
    setUsername(profile.username ?? '')
    setAvatarUrl(profile.avatar_url ?? '')
    setInitialized(true)
  }

  async function saveProfile() {
    if (!profile) return
    setMessage('')
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        username: username.trim(),
        avatar_url: avatarUrl.trim() || null,
      })
      setMessage('Profil mis à jour.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur inconnue.')
    }
  }

  const previewAvatar = avatarUrl.trim() || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${profile?.id ?? 'animelist'}`

  return (
    <main>
      <div className="surface-panel" style={{ maxWidth: 760 }}>
        <p className="eyebrow" style={{ margin: 0 }}>ESPACE UTILISATEUR</p>
        <h1 style={{ marginTop: 10 }}>Mon profil</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Gère ton pseudo, ton avatar et ton identité visible sur Animelist.
        </p>

        {isLoading ? (
          <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-line" style={{ height: 48, borderRadius: 16 }} aria-hidden="true" />
            ))}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '24px 0', flexWrap: 'wrap' }}>
              <img
                src={previewAvatar}
                alt="Avatar"
                onError={(e) => { e.currentTarget.src = 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=animelist' }}
                style={{ width: 96, height: 96, borderRadius: 24, objectFit: 'cover', background: 'var(--color-surface-hi)' }}
              />
              <div>
                <strong style={{ fontSize: 20 }}>{profile?.email}</strong>
                <p style={{ color: 'var(--color-text-muted)', margin: '6px 0 0' }}>
                  Rôle : <span style={{ color: profile?.role === 'admin' ? 'var(--color-accent-hi)' : 'var(--color-text)' }}>{profile?.role ?? 'user'}</span>
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, fontWeight: 900 }}>Pseudo</label>
              <input
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                minLength={3}
              />

              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, fontWeight: 900 }}>URL avatar (optionnel)</label>
              <input
                className="input-field"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />

              <button
                className="primary-btn"
                type="button"
                onClick={() => void saveProfile()}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </div>

            {message ? (
              <p style={{ color: message.includes('Erreur') || message.includes('erreur') ? '#ef4444' : '#4ade80', marginTop: 12 }}>
                {message}
              </p>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}

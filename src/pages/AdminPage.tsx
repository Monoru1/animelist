import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type AnimeRow = {
  id: string
  user_id: string
  title: string
  poster_url: string
  watch_url: string
  created_at: string
}

type ProfileRow = {
  id: string
  username: string
  email: string
  role: string
  created_at: string
}

async function fetchAdminData() {
  const [{ data: animes, error: animeError }, { data: profiles, error: profileError }] = await Promise.all([
    supabase.from('animes').select('id,user_id,title,poster_url,watch_url,created_at').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id,username,email,role,created_at').order('created_at', { ascending: false }),
  ])

  if (animeError) throw animeError
  if (profileError) throw profileError

  return {
    animes: (animes ?? []) as AnimeRow[],
    profiles: (profiles ?? []) as ProfileRow[],
  }
}

export function AdminPage() {
  const queryClient = useQueryClient()
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [targetAnime, setTargetAnime] = useState<AnimeRow | null>(null)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id

      if (!userId) {
        setIsCheckingAdmin(false)
        return
      }

      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
      setIsAdmin(data?.role === 'admin')
      setIsCheckingAdmin(false)
    }

    void checkAdmin()
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-data'],
    queryFn: fetchAdminData,
    enabled: isAdmin,
  })

  async function deleteAnime(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!targetAnime) return
    if (!reason.trim()) {
      setMessage('Raison obligatoire.')
      return
    }

    setLoadingAction(true)
    setMessage('')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const adminId = authData.user?.id ?? null

      const { error: deleteError } = await supabase.from('animes').delete().eq('id', targetAnime.id)
      if (deleteError) throw deleteError

      await supabase.from('notifications').insert({
        user_id: targetAnime.user_id,
        title: 'Animé supprimé',
        message: `Ton animé « ${targetAnime.title} » a été supprimé par la modération.`,
        reason: reason.trim(),
      })

      await supabase.from('moderation_logs').insert({
        admin_id: adminId,
        target_user_id: targetAnime.user_id,
        target_anime_id: targetAnime.id,
        action: 'delete_anime',
        reason: reason.trim(),
      })

      setReason('')
      setTargetAnime(null)
      setMessage('Animé supprimé et notification envoyée.')
      await queryClient.invalidateQueries({ queryKey: ['admin-data'] })
      await queryClient.invalidateQueries({ queryKey: ['public-animes'] })
    } catch (deleteError) {
      setMessage(deleteError instanceof Error ? deleteError.message : 'Erreur suppression.')
    } finally {
      setLoadingAction(false)
    }
  }

  if (isCheckingAdmin) return <p>Vérification des accès...</p>
  if (!isAdmin) return <Navigate to="/library" replace />

  return (
    <section>
      <div className="surface-panel" style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>ADMINISTRATION</p>
        <h1>Centre de contrôle</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Gestion interne, modération, utilisateurs et contenus communautaires.</p>
      </div>

      {isLoading ? <p>Chargement admin...</p> : null}
      {error ? <p>Impossible de charger les données admin.</p> : null}
      {message ? <p>{message}</p> : null}

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <section>
          <h2>Animés ajoutés</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {data?.animes.map((anime) => (
              <article key={anime.id} className="surface-panel" style={{ display: 'flex', gap: 12, padding: 12 }}>
                <img src={anime.poster_url} alt={anime.title} style={{ width: 70, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ overflow: 'hidden' }}>
                  <strong>{anime.title}</strong>
                  <p style={{ color: 'var(--color-text-muted)', overflowWrap: 'anywhere' }}>{anime.watch_url}</p>
                  <button className="secondary-btn" type="button" onClick={() => setTargetAnime(anime)}>Supprimer</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>Utilisateurs</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {data?.profiles.map((profile) => (
              <article key={profile.id} className="surface-panel" style={{ padding: 14 }}>
                <strong>{profile.username}</strong>
                <p>{profile.email}</p>
                <p>Role: {profile.role}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {targetAnime ? (
        <form onSubmit={deleteAnime} className="surface-panel" style={{ marginTop: 24 }}>
          <h2>Supprimer « {targetAnime.title} »</h2>
          <textarea className="input-field" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Raison obligatoire" required rows={4} />
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="primary-btn" type="submit" disabled={loadingAction}>{loadingAction ? 'Suppression...' : 'Confirmer la suppression'}</button>
            <button className="secondary-btn" type="button" onClick={() => setTargetAnime(null)}>Annuler</button>
          </div>
        </form>
      ) : null}
    </section>
  )
}

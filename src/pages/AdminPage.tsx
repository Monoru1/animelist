import { useState } from 'react'
import type { FormEvent } from 'react'
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
  const [targetAnime, setTargetAnime] = useState<AnimeRow | null>(null)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-data'],
    queryFn: fetchAdminData,
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

      const notificationPayload = {
        user_id: targetAnime.user_id,
        title: 'Animé supprimé',
        message: `Ton animé « ${targetAnime.title} » a été supprimé par la modération.`,
        reason: reason.trim(),
      }

      const logPayload = {
        admin_id: adminId,
        target_user_id: targetAnime.user_id,
        target_anime_id: targetAnime.id,
        action: 'delete_anime',
        reason: reason.trim(),
      }

      await supabase.from('notifications').insert(notificationPayload)
      await supabase.from('moderation_logs').insert(logPayload)

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

  return (
    <section>
      <h1>Administration</h1>
      <p>Gestion interne depuis le site. Aucun besoin d’aller dans Supabase.</p>
      {isLoading ? <p>Chargement admin...</p> : null}
      {error ? <p>Impossible de charger les données admin.</p> : null}
      {message ? <p>{message}</p> : null}

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        <section>
          <h2>Animés ajoutés</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {data?.animes.map((anime) => (
              <article key={anime.id} style={{ display: 'flex', gap: 12, border: '1px solid var(--color-border)', padding: 12, borderRadius: 12 }}>
                <img src={anime.poster_url} alt={anime.title} style={{ width: 70, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                <div>
                  <strong>{anime.title}</strong>
                  <p>{anime.watch_url}</p>
                  <button type="button" onClick={() => setTargetAnime(anime)}>Supprimer</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>Utilisateurs</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {data?.profiles.map((profile) => (
              <article key={profile.id} style={{ border: '1px solid var(--color-border)', padding: 12, borderRadius: 12 }}>
                <strong>{profile.username}</strong>
                <p>{profile.email}</p>
                <p>Role: {profile.role}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {targetAnime ? (
        <form onSubmit={deleteAnime} style={{ marginTop: 24, border: '1px solid var(--color-border)', padding: 16, borderRadius: 16 }}>
          <h2>Supprimer « {targetAnime.title} »</h2>
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Raison obligatoire" required style={{ width: '100%', minHeight: 100 }} />
          <button type="submit" disabled={loadingAction}>{loadingAction ? 'Suppression...' : 'Confirmer la suppression'}</button>
          <button type="button" onClick={() => setTargetAnime(null)}>Annuler</button>
        </form>
      ) : null}
    </section>
  )
}

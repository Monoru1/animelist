import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
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

type EpisodeRow = {
  id: string
  anime_id: string
  episode_number: number
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

function buildEpisodeUrl(template: string, episodeNumber: number) {
  const value = template.trim()
  if (!value) return ''
  if (value.includes('{episode}')) return value.replaceAll('{episode}', String(episodeNumber))
  if (value.includes('{ep2}')) return value.replaceAll('{ep2}', String(episodeNumber).padStart(2, '0'))
  return episodeNumber === 1 ? value : ''
}

function sourceTypeFromUrl(url: string) {
  const lower = url.toLowerCase()
  if (lower.includes('.mp4') || lower.includes('.webm')) return 'video'
  if (lower.includes('.m3u8')) return 'hls'
  return 'embed'
}

export function AdminPage() {
  const queryClient = useQueryClient()
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [targetAnime, setTargetAnime] = useState<AnimeRow | null>(null)
  const [sourceAnime, setSourceAnime] = useState<AnimeRow | null>(null)
  const [sourceTemplate, setSourceTemplate] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('VOSTFR')
  const [sourceQuality, setSourceQuality] = useState('HD')
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

  async function addSourcePack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!sourceAnime || !sourceTemplate.trim()) return

    setLoadingAction(true)
    setMessage('')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const adminId = authData.user?.id
      if (!adminId) throw new Error('Session admin introuvable.')

      const { data: episodes, error: episodeError } = await supabase
        .from('anime_episodes')
        .select('id,anime_id,episode_number')
        .eq('anime_id', sourceAnime.id)
        .order('episode_number', { ascending: true })

      if (episodeError) throw episodeError

      const rows = ((episodes ?? []) as EpisodeRow[])
        .map((episode) => ({ episode, url: buildEpisodeUrl(sourceTemplate, episode.episode_number) }))
        .filter((entry) => entry.url)
        .map((entry, index) => ({
          episode_id: entry.episode.id,
          label: `${sourceLanguage} ${sourceQuality}`,
          language: sourceLanguage,
          quality: sourceQuality,
          source_url: entry.url,
          source_type: sourceTypeFromUrl(entry.url),
          is_default: index === 0,
          is_active: true,
          created_by: adminId,
        }))

      if (rows.length === 0) throw new Error('Aucune source générée. Utilise une URL directe pour EP1 ou un modèle avec {episode} / {ep2}.')

      const { error: sourceError } = await supabase.from('episode_sources').insert(rows)
      if (sourceError) throw sourceError

      setSourceTemplate('')
      setSourceAnime(null)
      setMessage(`${rows.length} source(s) ajoutée(s) pour ${sourceAnime.title}.`)
      await queryClient.invalidateQueries({ queryKey: ['admin-data'] })
      await queryClient.invalidateQueries({ queryKey: ['watch-payload', sourceAnime.id] })
    } catch (sourceError) {
      setMessage(sourceError instanceof Error ? sourceError.message : 'Erreur ajout source.')
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
        <p style={{ color: 'var(--color-text-muted)' }}>Gestion interne, modération, sources et contenus communautaires.</p>
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
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="secondary-btn" to={`/watch/${anime.id}`}>Player</Link>
                    <button className="secondary-btn" type="button" onClick={() => setSourceAnime(anime)}>Sources</button>
                    <button className="secondary-btn" type="button" onClick={() => setTargetAnime(anime)}>Supprimer</button>
                  </div>
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

      {sourceAnime ? (
        <form onSubmit={addSourcePack} className="surface-panel" style={{ marginTop: 24 }}>
          <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>SOURCE PACK</p>
          <h2>Préparer les épisodes de « {sourceAnime.title} »</h2>
          <input className="input-field" value={sourceTemplate} onChange={(event) => setSourceTemplate(event.target.value)} placeholder="URL directe ou modèle avec {episode} / {ep2}" required />
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 12 }}>
            <select className="input-field" value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)}>
              <option>VOSTFR</option>
              <option>VF</option>
              <option>VF/VOSTFR</option>
            </select>
            <select className="input-field" value={sourceQuality} onChange={(event) => setSourceQuality(event.target.value)}>
              <option>HD</option>
              <option>1080p</option>
              <option>720p</option>
              <option>SD</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="primary-btn" type="submit" disabled={loadingAction}>{loadingAction ? 'Préparation...' : 'Préparer les épisodes'}</button>
            <button className="secondary-btn" type="button" onClick={() => setSourceAnime(null)}>Annuler</button>
          </div>
        </form>
      ) : null}

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

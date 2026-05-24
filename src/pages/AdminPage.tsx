import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'
import {
  useAdminStats,
  useAdminAnimes,
  useAdminProfiles,
  useDeleteAnimeAsAdmin,
  useAddSourcePack,
  useSendGlobalNotification,
} from '@/features/admin/hooks/useAdmin'
import type { AdminAnime } from '@/features/admin/api/admin'
import { ROUTES } from '@/app/routes'

type Tab = 'overview' | 'animes' | 'sources' | 'notifications' | 'moderation'

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="admin-stat-card">
      <p className="admin-stat-value" style={{ color: color ?? 'var(--color-accent-hi)' }}>{value}</p>
      <p className="admin-stat-label">{label}</p>
    </div>
  )
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminId, setAdminId] = useState('')

  // Source pack state
  const [sourceAnime, setSourceAnime] = useState<AdminAnime | null>(null)
  const [sourceTemplate, setSourceTemplate] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('VOSTFR')
  const [sourceQuality, setSourceQuality] = useState('HD')

  // Delete state
  const [targetAnime, setTargetAnime] = useState<AdminAnime | null>(null)
  const [deleteReason, setDeleteReason] = useState('')

  // Global notif state
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMessage, setNotifMessage] = useState('')

  const [feedback, setFeedback] = useState('')

  useQuery({
    queryKey: ['admin-check'],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id
      if (!userId) { setIsCheckingAdmin(false); return null }
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
      setIsAdmin(data?.role === 'admin')
      setAdminId(userId)
      setIsCheckingAdmin(false)
      return data
    },
  })

  const { data: stats } = useAdminStats()
  const { data: animes = [], isLoading: animesLoading } = useAdminAnimes()
  const { data: profiles = [], isLoading: profilesLoading } = useAdminProfiles()
  const deleteAnime = useDeleteAnimeAsAdmin()
  const addSource = useAddSourcePack()
  const sendNotif = useSendGlobalNotification()

  if (isCheckingAdmin) return <p style={{ padding: 32 }}>Vérification des accès…</p>
  if (!isAdmin) return <Navigate to={ROUTES.LIBRARY} replace />

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'animes', label: 'Animés' },
    { id: 'sources', label: 'Sources' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'moderation', label: 'Modération' },
  ]

  async function handleDeleteAnime(e: FormEvent) {
    e.preventDefault()
    if (!targetAnime || !deleteReason.trim()) return
    setFeedback('')
    try {
      await deleteAnime.mutateAsync({
        animeId: targetAnime.id,
        userId: targetAnime.user_id,
        title: targetAnime.title,
        reason: deleteReason,
        adminId,
      })
      setTargetAnime(null)
      setDeleteReason('')
      setFeedback('✓ Animé supprimé et notification envoyée.')
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erreur suppression.')
    }
  }

  async function handleAddSource(e: FormEvent) {
    e.preventDefault()
    if (!sourceAnime || !sourceTemplate.trim()) return
    setFeedback('')
    try {
      const count = await addSource.mutateAsync({
        animeId: sourceAnime.id,
        adminId,
        template: sourceTemplate,
        language: sourceLanguage,
        quality: sourceQuality,
      })
      setSourceAnime(null)
      setSourceTemplate('')
      setFeedback(`✓ ${count} source(s) ajoutée(s) pour « ${sourceAnime.title} ».`)
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erreur source.')
    }
  }

  async function handleSendNotif(e: FormEvent) {
    e.preventDefault()
    if (!notifTitle.trim() || !notifMessage.trim()) return
    setFeedback('')
    try {
      await sendNotif.mutateAsync({ title: notifTitle, message: notifMessage })
      setNotifTitle('')
      setNotifMessage('')
      setFeedback('✓ Notification globale envoyée à tous les utilisateurs.')
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erreur notification.')
    }
  }

  return (
    <main className="admin-page">
      {/* Header */}
      <div className="surface-panel admin-header">
        <p className="eyebrow" style={{ margin: 0 }}>ADMINISTRATION</p>
        <h1>Centre de contrôle</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Gestion interne, modération, sources et contenus communautaires.
        </p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-tab${activeTab === tab.id ? ' admin-tab--active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setFeedback('') }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {feedback ? (
        <div className={`admin-feedback${feedback.startsWith('✓') ? ' admin-feedback--success' : ' admin-feedback--error'}`}>
          {feedback}
        </div>
      ) : null}

      {/* ── VUE D'ENSEMBLE ─────────────────────────────────────── */}
      {activeTab === 'overview' ? (
        <div className="admin-overview">
          <div className="admin-stats-grid">
            <StatCard label="Animés total" value={stats?.animeCount ?? 0} />
            <StatCard label="Utilisateurs" value={stats?.userCount ?? 0} color="#4ade80" />
          </div>
          <div className="admin-quick-links surface-panel">
            <h2>Accès rapides</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="secondary-btn" type="button" onClick={() => setActiveTab('animes')}>Gestion animés</button>
              <button className="secondary-btn" type="button" onClick={() => setActiveTab('sources')}>Ajouter des sources</button>
              <button className="secondary-btn" type="button" onClick={() => setActiveTab('notifications')}>Envoyer une notif</button>
              <button className="secondary-btn" type="button" onClick={() => setActiveTab('moderation')}>Voir utilisateurs</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── GESTION ANIMÉS ─────────────────────────────────────── */}
      {activeTab === 'animes' ? (
        <div className="admin-section">
          <h2>Animés ajoutés ({animes.length})</h2>
          {animesLoading ? <p>Chargement…</p> : null}
          <div className="admin-anime-list">
            {animes.map((anime) => (
              <div key={anime.id} className="admin-anime-row surface-panel">
                <img src={anime.poster_url} alt={anime.title} className="admin-anime-thumb" />
                <div className="admin-anime-info">
                  <strong>{anime.title}</strong>
                  {anime.genre ? <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{anime.genre}</span> : null}
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{new Date(anime.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="admin-anime-actions">
                  <Link className="secondary-btn" to={ROUTES.WATCH(anime.id)}>Player</Link>
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => { setSourceAnime(anime); setActiveTab('sources') }}
                  >Sources</button>
                  <button
                    className="secondary-btn"
                    type="button"
                    style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,.3)' }}
                    onClick={() => setTargetAnime(anime)}
                  >Supprimer</button>
                </div>
              </div>
            ))}
          </div>

          {/* Confirm delete */}
          {targetAnime ? (
            <form onSubmit={(e) => void handleDeleteAnime(e)} className="surface-panel admin-form">
              <h3>Supprimer « {targetAnime.title} »</h3>
              <textarea
                className="input-field"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Raison obligatoire (visible par l'utilisateur)"
                required
                rows={3}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="primary-btn" type="submit" disabled={deleteAnime.isPending} style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                  {deleteAnime.isPending ? 'Suppression…' : 'Confirmer la suppression'}
                </button>
                <button className="secondary-btn" type="button" onClick={() => setTargetAnime(null)}>Annuler</button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}

      {/* ── SOURCES ────────────────────────────────────────────── */}
      {activeTab === 'sources' ? (
        <div className="admin-section">
          <h2>Ajouter des sources</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Sélectionne un animé dans la liste ci-dessous, puis configure le template d'URL.
          </p>

          {/* Sélecteur anime */}
          {!sourceAnime ? (
            <div className="admin-anime-list">
              {animes.map((anime) => (
                <div key={anime.id} className="admin-anime-row surface-panel" style={{ cursor: 'pointer' }} onClick={() => setSourceAnime(anime)}>
                  <img src={anime.poster_url} alt={anime.title} className="admin-anime-thumb" />
                  <div className="admin-anime-info">
                    <strong>{anime.title}</strong>
                    {anime.genre ? <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{anime.genre}</span> : null}
                  </div>
                  <button className="secondary-btn" type="button">Configurer</button>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={(e) => void handleAddSource(e)} className="surface-panel admin-form">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <img src={sourceAnime.poster_url} alt={sourceAnime.title} style={{ width: 48, borderRadius: 10 }} />
                <div>
                  <strong>{sourceAnime.title}</strong>
                  <button type="button" className="secondary-btn" style={{ marginLeft: 12, padding: '6px 12px', fontSize: 13 }} onClick={() => setSourceAnime(null)}>Changer</button>
                </div>
              </div>

              <label style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,.7)' }}>URL modèle</label>
              <input
                className="input-field"
                value={sourceTemplate}
                onChange={(e) => setSourceTemplate(e.target.value)}
                placeholder="https://cdn.ex.com/ep-{ep2}.mp4 ou URL directe EP1"
                required
              />
              <p style={{ color: 'var(--color-text-muted)', fontSize: 12, margin: '4px 0 12px' }}>
                Variables : <code style={{ background: 'rgba(255,255,255,.08)', padding: '2px 6px', borderRadius: 6 }}>{'{episode}'}</code> → 1,2,3… | <code style={{ background: 'rgba(255,255,255,.08)', padding: '2px 6px', borderRadius: 6 }}>{'{ep2}'}</code> → 01,02,03…
              </p>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,.7)' }}>Langue</label>
                  <select className="input-field" value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
                    <option>VOSTFR</option>
                    <option>VF</option>
                    <option>VF/VOSTFR</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,.7)' }}>Qualité</label>
                  <select className="input-field" value={sourceQuality} onChange={(e) => setSourceQuality(e.target.value)}>
                    <option>HD</option>
                    <option>1080p</option>
                    <option>720p</option>
                    <option>SD</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button className="primary-btn" type="submit" disabled={addSource.isPending}>
                  {addSource.isPending ? 'Ajout en cours…' : 'Générer les sources'}
                </button>
                <button className="secondary-btn" type="button" onClick={() => setSourceAnime(null)}>Annuler</button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      {/* ── NOTIFICATIONS ──────────────────────────────────────── */}
      {activeTab === 'notifications' ? (
        <div className="admin-section">
          <h2>Envoyer une notification globale</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Ce message sera envoyé à tous les utilisateurs enregistrés.
          </p>
          <form onSubmit={(e) => void handleSendNotif(e)} className="surface-panel admin-form">
            <label style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,.7)' }}>Titre</label>
            <input
              className="input-field"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="Ex: Nouvelle fonctionnalité disponible !"
              required
            />
            <label style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,.7)' }}>Message</label>
            <textarea
              className="input-field"
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="Détails du message…"
              rows={4}
              required
            />
            <button className="primary-btn" type="submit" disabled={sendNotif.isPending}>
              {sendNotif.isPending ? 'Envoi…' : '📢 Envoyer à tous'}
            </button>
          </form>
        </div>
      ) : null}

      {/* ── MODÉRATION ─────────────────────────────────────────── */}
      {activeTab === 'moderation' ? (
        <div className="admin-section">
          <h2>Utilisateurs ({profiles.length})</h2>
          {profilesLoading ? <p>Chargement…</p> : null}
          <div className="admin-users-list">
            {profiles.map((profile) => (
              <div key={profile.id} className="surface-panel admin-user-row">
                <div>
                  <strong>{profile.username}</strong>
                  <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 0', fontSize: 13 }}>{profile.email}</p>
                </div>
                <span
                  className="admin-role-badge"
                  style={{
                    background: profile.role === 'admin' ? 'rgba(124,92,255,.2)' : 'rgba(255,255,255,.06)',
                    color: profile.role === 'admin' ? 'var(--color-accent-hi)' : 'var(--color-text-muted)',
                  }}
                >
                  {profile.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  )
}

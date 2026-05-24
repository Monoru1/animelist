import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { supabase } from '@/services/supabaseClient'

// ---------------------------------------------------------------------------
// URL whitelist — domaines autorisés pour les sources de visionnage
// ---------------------------------------------------------------------------
const ALLOWED_WATCH_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'crunchyroll.com',
  'adn.film',
  'animationdigitalnetwork.fr',
  'wakanim.tv',
  'funimation.com',
  'animeunity.to',
  'animeunity.tv',
  'nyaa.si',
  'nyaa.land',
  'mega.nz',
  'drive.google.com',
  'dailymotion.com',
  'ok.ru',
]

function validateWatchUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return 'Lien de visionnage requis.'

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return 'URL invalide — vérifie le format (ex: https://...).'
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return 'Seules les URLs http/https sont acceptées.'
  }

  const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase()
  const allowed = ALLOWED_WATCH_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  )

  if (!allowed) {
    return `Domaine non autorisé. Domaines acceptés : ${ALLOWED_WATCH_DOMAINS.slice(0, 6).join(', ')}…`
  }

  return null
}

// ---------------------------------------------------------------------------

export function AddAnimePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [watchUrl, setWatchUrl] = useState('')
  const [watchUrlError, setWatchUrlError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [metadataLoading, setMetadataLoading] = useState(false)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setPosterFile(file)
    if (file) setImageUrl('')
  }

  function handleWatchUrlChange(value: string) {
    setWatchUrl(value)
    if (watchUrlError) setWatchUrlError('')
  }

  function handleWatchUrlBlur() {
    if (watchUrl.trim()) {
      const err = validateWatchUrl(watchUrl)
      setWatchUrlError(err ?? '')
    }
  }

  async function importMetadata(queryOverride?: string) {
    const searchValue = queryOverride ?? title

    if (!searchValue.trim()) {
      setErrorMessage('Titre anime requis.')
      return
    }

    setMetadataLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const { data, error } = await supabase.functions.invoke('anime-metadata', {
        body: {
          title: searchValue,
          url: watchUrl,
        },
      })

      if (error) throw error
      if (!data) throw new Error('Import impossible.')

      setTitle(data.title || title)
      setDescription(data.description || '')
      setGenre(data.genre || '')
      setImageUrl(data.poster_url || '')
      setPosterFile(null)
      setSuccessMessage('Informations importées automatiquement.')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Import impossible.')
    } finally {
      setMetadataLoading(false)
    }
  }

  useEffect(() => {
    if (title.trim().length < 3 || description || genre || imageUrl) return

    const timeout = window.setTimeout(() => {
      void importMetadata(title)
    }, 900)

    return () => window.clearTimeout(timeout)
    // importMetadata est stable entre les renders qui comptent ici
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  async function resolvePosterUrl(userId: string): Promise<string> {
    if (!posterFile) return imageUrl

    if (!posterFile.type.startsWith('image/')) throw new Error('Le fichier doit être une image.')

    const extension = posterFile.name.split('.').pop() ?? 'webp'
    const path = `${userId}/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage.from('anime-posters').upload(path, posterFile)
    if (error) throw error

    const { data } = supabase.storage.from('anime-posters').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user

      if (!user) throw new Error('Tu dois être connecté.')
      if (!title.trim()) throw new Error('Titre obligatoire.')
      if (!posterFile && !imageUrl.trim()) throw new Error('Affiche requise.')

      // Validation URL obligatoire avant insert
      if (watchUrl.trim()) {
        const urlErr = validateWatchUrl(watchUrl)
        if (urlErr) {
          setWatchUrlError(urlErr)
          throw new Error(urlErr)
        }
      }

      const finalPosterUrl = await resolvePosterUrl(user.id)

      const { error } = await supabase.from('animes').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        genre: genre.trim() || null,
        poster_url: finalPosterUrl,
        watch_url: watchUrl.trim() || null,
      })

      if (error) throw error

      setTitle('')
      setDescription('')
      setGenre('')
      setWatchUrl('')
      setWatchUrlError('')
      setImageUrl('')
      setPosterFile(null)
      setSuccessMessage('Animé ajouté avec succès.')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: '0 auto' }}>
      <div className="surface-panel">
        <p style={{ color: 'var(--color-accent-hi)', fontWeight: 900, margin: 0 }}>IMPORT ANIME</p>
        <h1>Ajouter un animé</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Mets le titre, colle le lien de visionnage, puis valide.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <input
            className="input-field"
            placeholder="Titre de l'anime"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <div style={{ display: 'grid', gap: 6 }}>
            <input
              className="input-field"
              placeholder="Lien de visionnage (ex: https://crunchyroll.com/...)"
              value={watchUrl}
              onChange={(event) => handleWatchUrlChange(event.target.value)}
              onBlur={handleWatchUrlBlur}
            />
            {watchUrlError ? (
              <p style={{ color: '#ff6b6b', fontSize: '0.8rem', margin: 0 }}>{watchUrlError}</p>
            ) : watchUrl.trim() && !watchUrlError ? (
              <p style={{ color: '#4ade80', fontSize: '0.8rem', margin: 0 }}>✓ URL valide</p>
            ) : null}
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: 0 }}>
              Domaines acceptés : Crunchyroll, ADN, Vimeo, YouTube, Wakanim, AnimeUnity, Nyaa…
            </p>
          </div>

          <button className="secondary-btn" type="button" onClick={() => void importMetadata()} disabled={metadataLoading}>
            {metadataLoading ? 'Recherche...' : 'Remplir automatiquement'}
          </button>

          <textarea className="input-field" placeholder="Description / synopsis" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
          <input className="input-field" placeholder="Genre" value={genre} onChange={(event) => setGenre(event.target.value)} />

          <div className="surface-panel" style={{ padding: 16 }}>
            <strong>Affiche</strong>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>Automatique si disponible. Sinon ajoute une image.</p>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <input
              className="input-field"
              placeholder="URL image optionnelle"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              disabled={Boolean(posterFile)}
              style={{ marginTop: 12 }}
            />
          </div>

          {(posterFile || imageUrl) ? (
            <div>
              <p>Aperçu affiche</p>
              <img src={posterFile ? URL.createObjectURL(posterFile) : imageUrl} alt="Aperçu" style={{ width: 180, borderRadius: 16 }} />
            </div>
          ) : null}

          <button className="primary-btn" type="submit" disabled={loading || Boolean(watchUrlError)}>
            {loading ? 'Ajout...' : 'Ajouter à la bibliothèque'}
          </button>
        </form>

        {successMessage ? <p style={{ color: '#4ade80' }}>{successMessage}</p> : null}
        {errorMessage ? <p style={{ color: '#ff6b6b' }}>{errorMessage}</p> : null}
      </div>
    </main>
  )
}

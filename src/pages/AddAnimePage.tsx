import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { supabase } from '@/services/supabaseClient'

export function AddAnimePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [watchUrl, setWatchUrl] = useState('')
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
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Import impossible.')
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
      if (!title.trim() || !watchUrl.trim()) throw new Error('Titre et lien de visionnage obligatoires.')
      if (!posterFile && !imageUrl.trim()) throw new Error('Affiche requise.')

      const finalPosterUrl = await resolvePosterUrl(user.id)

      const { error } = await supabase.from('animes').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        genre: genre.trim() || null,
        poster_url: finalPosterUrl,
        watch_url: watchUrl.trim(),
      })

      if (error) throw error

      setTitle('')
      setDescription('')
      setGenre('')
      setWatchUrl('')
      setImageUrl('')
      setPosterFile(null)
      setSuccessMessage('Animé ajouté avec succès.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
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
          <input className="input-field" placeholder="Titre de l’anime" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <input className="input-field" placeholder="Lien de visionnage" value={watchUrl} onChange={(event) => setWatchUrl(event.target.value)} required />

          <button className="secondary-btn" type="button" onClick={() => void importMetadata()} disabled={metadataLoading}>
            {metadataLoading ? 'Recherche...' : 'Remplir automatiquement'}
          </button>

          <textarea className="input-field" placeholder="Description / synopsis" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
          <input className="input-field" placeholder="Genre" value={genre} onChange={(event) => setGenre(event.target.value)} />

          <div className="surface-panel" style={{ padding: 16 }}>
            <strong>Affiche</strong>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>Automatique si disponible. Sinon ajoute une image.</p>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <input className="input-field" placeholder="URL image optionnelle" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} disabled={Boolean(posterFile)} style={{ marginTop: 12 }} />
          </div>

          {(posterFile || imageUrl) ? (
            <div>
              <p>Aperçu affiche</p>
              <img src={posterFile ? URL.createObjectURL(posterFile) : imageUrl} alt="Aperçu" style={{ width: 180, borderRadius: 16 }} />
            </div>
          ) : null}

          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Ajout...' : 'Ajouter à la bibliothèque'}</button>
        </form>

        {successMessage ? <p>{successMessage}</p> : null}
        {errorMessage ? <p style={{ color: '#ff6b6b' }}>{errorMessage}</p> : null}
      </div>
    </main>
  )
}

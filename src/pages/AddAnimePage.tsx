import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { supabase } from '@/services/supabaseClient'

type JikanAnime = {
  title?: string
  title_english?: string | null
  synopsis?: string | null
  genres?: { name: string }[]
  images?: { jpg?: { large_image_url?: string; image_url?: string } }
}

function extractAnimeQuery(value: string) {
  try {
    const url = new URL(value)
    const parts = url.pathname.split('/').filter(Boolean)
    const last = parts[parts.length - 1] ?? value
    return decodeURIComponent(last.replaceAll('-', ' ')).trim()
  } catch {
    return value.trim()
  }
}

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

  async function importMetadata() {
    const query = extractAnimeQuery(title || watchUrl)
    if (!query) {
      setErrorMessage('Mets un titre ou un lien avant l’import automatique.')
      return
    }

    setMetadataLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`)
      if (!response.ok) throw new Error('Impossible de récupérer les informations.')

      const json = await response.json() as { data?: JikanAnime[] }
      const anime = json.data?.[0]
      if (!anime) throw new Error('Aucun anime trouvé avec cette recherche.')

      setTitle(anime.title_english || anime.title || title)
      setDescription(anime.synopsis || '')
      setGenre((anime.genres ?? []).map((item) => item.name).join(', '))
      setImageUrl(anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || imageUrl)
      setPosterFile(null)
      setSuccessMessage('Informations importées. Vérifie puis valide.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Import impossible.')
    } finally {
      setMetadataLoading(false)
    }
  }

  async function resolvePosterUrl(userId: string): Promise<string> {
    if (!posterFile) return imageUrl

    if (!posterFile.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image.')
    }

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
      if (!posterFile && !imageUrl.trim()) throw new Error('Ajoute une affiche via fichier, URL ou import automatique.')

      const finalPosterUrl = await resolvePosterUrl(user.id)
      const animePayload = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        genre: genre.trim() || null,
        poster_url: finalPosterUrl,
        watch_url: watchUrl.trim(),
      }

      const { error } = await supabase.from('animes').insert(animePayload)
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
        <p style={{ color: 'var(--color-text-muted)' }}>Colle un lien ou un titre, importe les infos automatiquement, puis valide l’ajout.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <input className="input-field" placeholder="Titre ou recherche anime" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <input className="input-field" placeholder="Lien de visionnage" value={watchUrl} onChange={(event) => setWatchUrl(event.target.value)} required />

          <button className="secondary-btn" type="button" onClick={() => void importMetadata()} disabled={metadataLoading}>
            {metadataLoading ? 'Import...' : 'Importer automatiquement les informations'}
          </button>

          <textarea className="input-field" placeholder="Description / synopsis" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
          <input className="input-field" placeholder="Genre" value={genre} onChange={(event) => setGenre(event.target.value)} />

          <label>Affiche depuis ton appareil</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />

          <label>Ou URL de l’affiche</label>
          <input className="input-field" placeholder="https://image..." value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} disabled={Boolean(posterFile)} />

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

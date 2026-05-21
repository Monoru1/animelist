import { ChangeEvent, FormEvent, useState } from 'react'
import { supabase } from '@/services/supabaseClient'

export function AddAnimePage() {
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [watchUrl, setWatchUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setPosterFile(file)
    if (file) setImageUrl('')
  }

  async function uploadPoster(userId: string): Promise<string> {
    if (!posterFile) return imageUrl

    if (!posterFile.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image.')
    }

    const extension = posterFile.name.split('.').pop() ?? 'webp'
    const path = `${userId}/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage.from('anime-posters').upload(path, posterFile, {
      cacheControl: '3600',
      upsert: false,
    })

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
      if (!posterFile && !imageUrl.trim()) throw new Error('Ajoute une affiche via fichier ou URL.')

      const finalPosterUrl = await uploadPoster(user.id)

      const { error } = await supabase.from('animes').insert({
        user_id: user.id,
        title: title.trim(),
        genre: genre.trim() || null,
        poster_url: finalPosterUrl,
        watch_url: watchUrl.trim(),
      })

      if (error) throw error

      setTitle('')
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
    <main style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1>Ajouter un animé</h1>
      <p>Ajoute un animé à la bibliothèque publique. L’affiche et le lien sont obligatoires.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <input placeholder="Titre" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <input placeholder="Genre" value={genre} onChange={(event) => setGenre(event.target.value)} />
        <input placeholder="Lien de visionnage" value={watchUrl} onChange={(event) => setWatchUrl(event.target.value)} required />

        <label>Uploader une affiche depuis ton appareil</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <label>Ou mettre l’URL de l’affiche</label>
        <input placeholder="URL image" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} disabled={Boolean(posterFile)} />

        {(posterFile || imageUrl) ? (
          <div>
            <p>Aperçu affiche</p>
            <img src={posterFile ? URL.createObjectURL(posterFile) : imageUrl} alt="Aperçu" style={{ width: 180, borderRadius: 16 }} />
          </div>
        ) : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Ajout...' : 'Ajouter à la bibliothèque'}
        </button>
      </form>

      {successMessage ? <p>{successMessage}</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}
    </main>
  )
}

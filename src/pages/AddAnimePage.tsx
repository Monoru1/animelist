import { FormEvent, useState } from 'react'
import { supabase } from '@/services/supabaseClient'

export function AddAnimePage() {
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [watchUrl, setWatchUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    const { data: authData } = await supabase.auth.getUser()

    const user = authData.user

    if (!user) {
      setLoading(false)
      setErrorMessage('Tu dois être connecté.')
      return
    }

    if (!imageUrl || !watchUrl || !title) {
      setLoading(false)
      setErrorMessage('Titre, image et lien sont obligatoires.')
      return
    }

    const { error } = await supabase.from('animes').insert({
      user_id: user.id,
      title,
      genre,
      poster_url: imageUrl,
      watch_url: watchUrl,
    })

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setTitle('')
    setGenre('')
    setWatchUrl('')
    setImageUrl('')
    setSuccessMessage('Animé ajouté avec succès.')
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1>Ajouter un animé</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <input placeholder="Titre" value={title} onChange={(event) => setTitle(event.target.value)} required />

        <input placeholder="Genre" value={genre} onChange={(event) => setGenre(event.target.value)} />

        <input placeholder="URL image" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} required />

        <input placeholder="Lien de visionnage" value={watchUrl} onChange={(event) => setWatchUrl(event.target.value)} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>

      {successMessage ? <p>{successMessage}</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}
    </main>
  )
}

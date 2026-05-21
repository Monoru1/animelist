import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type AnimeRow = {
  id: string
  title: string
  poster_url: string
  watch_url: string
  genre: string | null
  created_at: string
}

async function fetchMyAnimes(): Promise<AnimeRow[]> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id

  if (!userId) return []

  const { data, error } = await supabase
    .from('animes')
    .select('id,title,poster_url,watch_url,genre,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function MyPlaylistPage() {
  const queryClient = useQueryClient()
  const { data: animes = [], isLoading, error } = useQuery({
    queryKey: ['my-animes'],
    queryFn: fetchMyAnimes,
  })

  async function deleteAnime(id: string) {
    const { error: deleteError } = await supabase.from('animes').delete().eq('id', id)

    if (deleteError) {
      alert(deleteError.message)
      return
    }

    await queryClient.invalidateQueries({ queryKey: ['my-animes'] })
    await queryClient.invalidateQueries({ queryKey: ['public-animes'] })
  }

  return (
    <main>
      <h1>Ma playlist</h1>
      <p>Les animés que tu as ajoutés à la bibliothèque publique.</p>

      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p>Impossible de charger ta playlist.</p> : null}
      {!isLoading && animes.length === 0 ? <p>Tu n’as pas encore ajouté d’animé.</p> : null}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {animes.map((anime) => (
          <article key={anime.id} style={{ border: '1px solid var(--color-border)', borderRadius: 18, overflow: 'hidden', background: 'var(--color-surface)' }}>
            <img src={anime.poster_url} alt={anime.title} style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover' }} />
            <div style={{ padding: 16 }}>
              <h2>{anime.title}</h2>
              {anime.genre ? <p>{anime.genre}</p> : null}
              <a href={anime.watch_url} target="_blank" rel="noreferrer">Regarder</a>
              <button type="button" onClick={() => void deleteAnime(anime.id)} style={{ display: 'block', marginTop: 12 }}>
                Supprimer de ma playlist
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

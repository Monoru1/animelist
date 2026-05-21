import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'

type LibraryAnime = {
  id: string
  title: string
  description: string | null
  genre: string | null
  poster_url: string
  watch_url: string
  created_at: string
}

async function fetchAnimes(): Promise<LibraryAnime[]> {
  const { data, error } = await supabase
    .from('animes')
    .select('id,title,description,genre,poster_url,watch_url,created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function LibraryPage() {
  const { data: animes = [], isLoading, error } = useQuery({
    queryKey: ['public-animes'],
    queryFn: fetchAnimes,
  })

  return (
    <section>
      <h1>Bibliothèque publique</h1>
      <p>Les animés ajoutés par la communauté apparaissent ici automatiquement.</p>

      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p>Impossible de charger la bibliothèque.</p> : null}

      {!isLoading && animes.length === 0 ? <p>Aucun animé ajouté pour le moment.</p> : null}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {animes.map((anime) => (
          <article key={anime.id} style={{ border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', background: 'var(--color-surface)' }}>
            <img src={anime.poster_url} alt={anime.title} style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover' }} />
            <div style={{ padding: 16 }}>
              <h2>{anime.title}</h2>
              {anime.genre ? <p>{anime.genre}</p> : null}
              <a href={anime.watch_url} target="_blank" rel="noreferrer">Regarder</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

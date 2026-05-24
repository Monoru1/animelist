import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFavorite, fetchFavorites, getFavoriteAnime, isFavorite, removeFavorite } from '@/services/favorites'

export { getFavoriteAnime }

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    staleTime: 1000 * 30,
    retry: 2,
    // Ne jamais propager l'erreur vers l'UI — retourner [] en cas d'échec
    throwOnError: false,
  })
}

export function useFavoriteState(animeId: string) {
  return useQuery({
    queryKey: ['favorite-state', animeId],
    queryFn: () => isFavorite(animeId),
    enabled: Boolean(animeId),
    staleTime: 1000 * 15,
    throwOnError: false,
  })
}

export function useToggleFavorite(animeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (shouldAdd: boolean) => {
      if (shouldAdd) {
        await addFavorite(animeId)
        return true
      }
      await removeFavorite(animeId)
      return false
    },
    onSuccess: async (newState) => {
      queryClient.setQueryData(['favorite-state', animeId], newState)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['favorites'] }),
        queryClient.invalidateQueries({ queryKey: ['favorite-state', animeId] }),
      ])
    },
  })
}

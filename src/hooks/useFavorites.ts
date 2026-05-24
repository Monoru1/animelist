import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFavorite, fetchFavorites, getFavoriteAnime, isFavorite, removeFavorite } from '@/services/favorites'

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    staleTime: 1000 * 30,
    retry: 1,
  })
}

export function useFavoriteState(animeId: string) {
  return useQuery({
    queryKey: ['favorite-state', animeId],
    queryFn: () => isFavorite(animeId),
    enabled: Boolean(animeId),
    staleTime: 1000 * 15,
  })
}

export function useToggleFavorite(animeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (shouldFavorite: boolean) => {
      if (shouldFavorite) {
        await addFavorite(animeId)
        return true
      }

      await removeFavorite(animeId)
      return false
    },
    onSuccess: async (isFav) => {
      queryClient.setQueryData(['favorite-state', animeId], isFav)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['favorites'] }),
        queryClient.invalidateQueries({ queryKey: ['favorite-state', animeId] }),
      ])
    },
  })
}

export { getFavoriteAnime }

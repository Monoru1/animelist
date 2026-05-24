import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteAnimeById, fetchMyAnimes, fetchPublicAnimes } from '../api/animes'

export function usePublicAnimes() {
  return useQuery({
    queryKey: ['public-animes'],
    queryFn: fetchPublicAnimes,
    staleTime: 1000 * 60 * 2,
  })
}

export function useMyAnimes() {
  return useQuery({
    queryKey: ['my-animes'],
    queryFn: fetchMyAnimes,
    staleTime: 1000 * 30,
  })
}

export function useDeleteAnime() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAnimeById,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-animes'] }),
        queryClient.invalidateQueries({ queryKey: ['public-animes'] }),
      ])
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCurrentProfile, updateProfile } from '../api/profile'

export function useCurrentProfile() {
  return useQuery({
    queryKey: ['current-profile'],
    queryFn: fetchCurrentProfile,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, username, avatar_url }: { id: string; username: string; avatar_url: string | null }) =>
      updateProfile(id, { username, avatar_url }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['current-profile'] }),
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addSourcePack, deleteAnimeAsAdmin, fetchAdminAnimes, fetchAdminProfiles, fetchAdminStats, sendGlobalNotification } from '../api/admin'
import { supabase } from '@/services/supabaseClient'

export function useAdminStats() {
  return useQuery({ queryKey: ['admin-stats'], queryFn: fetchAdminStats })
}

export function useAdminAnimes() {
  return useQuery({ queryKey: ['admin-animes'], queryFn: fetchAdminAnimes })
}

export function useAdminProfiles() {
  return useQuery({ queryKey: ['admin-profiles'], queryFn: fetchAdminProfiles })
}

export function useDeleteAnimeAsAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { animeId: string; userId: string; title: string; reason: string; adminId: string }) =>
      deleteAnimeAsAdmin(args.animeId, args.userId, args.title, args.reason, args.adminId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-animes'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['public-animes'] }),
      ]),
  })
}

export function useAddSourcePack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { animeId: string; adminId: string; template: string; language: string; quality: string }) =>
      addSourcePack(args.animeId, args.adminId, args.template, args.language, args.quality),
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: ['watch-payload', vars.animeId] }),
  })
}

export function useSendGlobalNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (args: { title: string; message: string }) => {
      const { data } = await supabase.auth.getUser()
      const adminId = data.user?.id ?? ''
      await sendGlobalNotification(args.title, args.message, adminId)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

import { useQuery } from '@tanstack/react-query'
import { fetchWatchHistory } from '../api/watchHistory'

export function useWatchHistory() {
  return useQuery({
    queryKey: ['watch-history'],
    queryFn: fetchWatchHistory,
    staleTime: 1000 * 30,
  })
}

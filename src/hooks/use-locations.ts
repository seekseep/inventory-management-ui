import { useQuery } from '@tanstack/react-query'
import { getLocation, getLocations } from '#/lib/api'
import { locationKeys } from '#/lib/query-keys'

export function useLocations() {
  return useQuery({
    queryKey: locationKeys.list(),
    queryFn: getLocations,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: locationKeys.detail(id),
    queryFn: () => getLocation(id),
    staleTime: 5 * 60 * 1000,
  })
}

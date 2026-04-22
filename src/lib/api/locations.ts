import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api-client'
import { DEFAULT_STALE_TIME } from '#/lib/constants'
import type { Location } from '#/lib/types'

export function getLocations() {
  return apiGet<Location[]>('/api/locations')
}

export function getLocation(id: string) {
  return apiGet<Location>(`/api/locations/${id}`)
}

export const locationKeys = {
  all: ['locations'] as const,
  list: () => [...locationKeys.all, 'list'] as const,
  detail: (id: string) => [...locationKeys.all, 'detail', id] as const,
}

export function useLocations() {
  return useQuery({
    queryKey: locationKeys.list(),
    queryFn: getLocations,
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: locationKeys.detail(id),
    queryFn: () => getLocation(id),
    staleTime: DEFAULT_STALE_TIME,
  })
}

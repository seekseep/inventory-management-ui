import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api-client'
import { DEFAULT_STALE_TIME } from '#/lib/constants'
import type { Item } from '#/lib/types'

export function getItems() {
  return apiGet<Item[]>('/api/items')
}

export function getItem(id: string) {
  return apiGet<Item>(`/api/items/${id}`)
}

export const itemKeys = {
  all: ['items'] as const,
  list: () => [...itemKeys.all, 'list'] as const,
  detail: (id: string) => [...itemKeys.all, 'detail', id] as const,
}

export function useItems() {
  return useQuery({
    queryKey: itemKeys.list(),
    queryFn: getItems,
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: () => getItem(id),
    staleTime: DEFAULT_STALE_TIME,
  })
}

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api-client'
import { DEFAULT_STALE_TIME } from '#/lib/constants'
import type { ItemCategory } from '#/lib/types'

export function getItemCategories() {
  return apiGet<ItemCategory[]>('/api/item-categories')
}

export function getItemCategory(id: string) {
  return apiGet<ItemCategory>(`/api/item-categories/${id}`)
}

export const itemCategoryKeys = {
  all: ['item-categories'] as const,
  list: () => [...itemCategoryKeys.all, 'list'] as const,
  detail: (id: string) => [...itemCategoryKeys.all, 'detail', id] as const,
}

export function useItemCategories() {
  return useQuery({
    queryKey: itemCategoryKeys.list(),
    queryFn: getItemCategories,
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function useItemCategory(id: string) {
  return useQuery({
    queryKey: itemCategoryKeys.detail(id),
    queryFn: () => getItemCategory(id),
    staleTime: DEFAULT_STALE_TIME,
  })
}

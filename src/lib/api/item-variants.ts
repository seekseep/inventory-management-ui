import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api-client'
import { DEFAULT_STALE_TIME } from '#/lib/constants'
import type { ItemVariant } from '#/lib/types'

export function getItemVariants(params?: { itemId?: string }) {
  const queryParams: Record<string, string> = {}
  if (params?.itemId) queryParams.itemId = params.itemId
  return apiGet<ItemVariant[]>('/api/item-variants', queryParams)
}

export function getItemVariant(id: string) {
  return apiGet<ItemVariant>(`/api/item-variants/${id}`)
}

export const itemVariantKeys = {
  all: ['item-variants'] as const,
  list: (params?: { itemId?: string }) =>
    [...itemVariantKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...itemVariantKeys.all, 'detail', id] as const,
}

export function useItemVariants(params?: { itemId?: string }) {
  return useQuery({
    queryKey: itemVariantKeys.list(params),
    queryFn: () => getItemVariants(params),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function useItemVariant(id: string) {
  return useQuery({
    queryKey: itemVariantKeys.detail(id),
    queryFn: () => getItemVariant(id),
    staleTime: DEFAULT_STALE_TIME,
  })
}

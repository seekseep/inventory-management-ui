import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api-client'
import { DEFAULT_STALE_TIME } from '#/lib/constants'
import type { Inventory } from '#/lib/types'

export function getInventories(params?: {
  locationId?: string
  itemVariantId?: string
}) {
  const queryParams: Record<string, string> = {}
  if (params?.locationId) queryParams.locationId = params.locationId
  if (params?.itemVariantId) queryParams.itemVariantId = params.itemVariantId
  return apiGet<Inventory[]>('/api/inventories', queryParams)
}

export function getInventory(id: string) {
  return apiGet<Inventory>(`/api/inventories/${id}`)
}

export const inventoryKeys = {
  all: ['inventories'] as const,
  list: (params?: { locationId?: string; itemVariantId?: string }) =>
    [...inventoryKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...inventoryKeys.all, 'detail', id] as const,
}

export function useInventories(params?: {
  locationId?: string
  itemVariantId?: string
}) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => getInventories(params),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function useInventory(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => getInventory(id),
    staleTime: DEFAULT_STALE_TIME,
  })
}

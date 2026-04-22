import { useQuery } from '@tanstack/react-query'
import { getInventories, getInventory } from '#/lib/api'
import { inventoryKeys } from '#/lib/query-keys'

export function useInventories(params?: {
  locationId?: string
  itemId?: string
}) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => getInventories(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useInventory(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => getInventory(id),
    staleTime: 5 * 60 * 1000,
  })
}

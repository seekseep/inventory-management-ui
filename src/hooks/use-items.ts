import { useQuery } from '@tanstack/react-query'
import { getItem, getItems } from '#/lib/api'
import { itemKeys } from '#/lib/query-keys'

export function useItems() {
  return useQuery({
    queryKey: itemKeys.list(),
    queryFn: getItems,
    staleTime: 5 * 60 * 1000,
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: () => getItem(id),
    staleTime: 5 * 60 * 1000,
  })
}

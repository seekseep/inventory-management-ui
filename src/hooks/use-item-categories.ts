import { useQuery } from '@tanstack/react-query'
import { getItemCategories, getItemCategory } from '#/lib/api'
import { itemCategoryKeys } from '#/lib/query-keys'

export function useItemCategories() {
  return useQuery({
    queryKey: itemCategoryKeys.list(),
    queryFn: getItemCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useItemCategory(id: string) {
  return useQuery({
    queryKey: itemCategoryKeys.detail(id),
    queryFn: () => getItemCategory(id),
    staleTime: 5 * 60 * 1000,
  })
}

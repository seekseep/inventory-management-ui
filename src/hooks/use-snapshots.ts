import { useQuery } from '@tanstack/react-query'
import { getSnapshot, getSnapshots } from '#/lib/api'
import { snapshotKeys } from '#/lib/query-keys'

export function useSnapshots() {
  return useQuery({
    queryKey: snapshotKeys.list(),
    queryFn: getSnapshots,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSnapshot(id: string) {
  return useQuery({
    queryKey: snapshotKeys.detail(id),
    queryFn: () => getSnapshot(id),
    staleTime: 5 * 60 * 1000,
  })
}

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api-client'
import { DEFAULT_STALE_TIME } from '#/lib/constants'
import type { Snapshot, SnapshotWithItems } from '#/lib/types'

export function getSnapshots() {
  return apiGet<Snapshot[]>('/api/snapshots')
}

export function getSnapshot(id: string) {
  return apiGet<SnapshotWithItems>(`/api/snapshots/${id}`)
}

export const snapshotKeys = {
  all: ['snapshots'] as const,
  list: () => [...snapshotKeys.all, 'list'] as const,
  detail: (id: string) => [...snapshotKeys.all, 'detail', id] as const,
}

export function useSnapshots() {
  return useQuery({
    queryKey: snapshotKeys.list(),
    queryFn: getSnapshots,
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function useSnapshot(id: string) {
  return useQuery({
    queryKey: snapshotKeys.detail(id),
    queryFn: () => getSnapshot(id),
    staleTime: DEFAULT_STALE_TIME,
  })
}

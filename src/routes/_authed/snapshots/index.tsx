import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { useLocations } from '#/lib/api/locations'
import { useSnapshots } from '#/lib/api/snapshots'
import type { Snapshot } from '#/lib/types'

type SearchParams = { q?: string; page?: number }

export const Route = createFileRoute('/_authed/snapshots/')({
  staticData: { title: '棚卸' },
  component: SnapshotCollection,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: (search.q as string) || undefined,
    page: Number(search.page) || undefined,
  }),
})

const columnHelper = createColumnHelper<Snapshot & { locationName?: string }>()

const columns = [
  columnHelper.accessor('locationName', {
    header: 'ロケーション',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('note', {
    header: 'メモ',
    cell: (info) => {
      const note = info.getValue()
      if (!note) return '—'
      return note.length > 40 ? `${note.slice(0, 40)}...` : note
    },
  }),
  columnHelper.accessor('createdAt', {
    header: '日時',
    cell: (info) => new Date(info.getValue()).toLocaleDateString('ja-JP'),
  }),
]

function SnapshotCollection() {
  const navigate = useNavigate()
  const { q, page } = Route.useSearch()
  const { data: snapshots, isLoading } = useSnapshots()
  const { data: locations } = useLocations()

  const locationMap = new Map((locations ?? []).map((l) => [l.id, l.name]))

  const data = (snapshots ?? [])
    .map((snap) => ({
      ...snap,
      locationName: locationMap.get(snap.locationId),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">棚卸一覧</h2>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        globalFilter={q ?? ''}
        onGlobalFilterChange={(value) =>
          navigate({
            search: (prev: SearchParams) => ({
              ...prev,
              q: value || undefined,
              page: undefined,
            }),
            replace: true,
          })
        }
        pageIndex={page ? page - 1 : 0}
        onPageIndexChange={(index) =>
          navigate({
            search: (prev: SearchParams) => ({
              ...prev,
              page: index > 0 ? index + 1 : undefined,
            }),
            replace: true,
          })
        }
        onRowClick={(row) =>
          navigate({ to: '/snapshots/$id', params: { id: row.id } })
        }
      />
    </div>
  )
}

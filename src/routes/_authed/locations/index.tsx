import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { LocationTypeBadge } from '#/components/StatusBadge'
import { useLocations } from '#/lib/api/locations'
import type { Location } from '#/lib/types'

type SearchParams = { q?: string; page?: number }

export const Route = createFileRoute('/_authed/locations/')({
  staticData: { title: 'ロケーション' },
  component: LocationCollection,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: (search.q as string) || undefined,
    page: Number(search.page) || undefined,
  }),
})

const columnHelper = createColumnHelper<Location>()

const columns = [
  columnHelper.accessor('name', { header: '名前' }),
  columnHelper.accessor('type', {
    header: 'タイプ',
    cell: (info) => <LocationTypeBadge type={info.getValue()} />,
  }),
  columnHelper.accessor('address', {
    header: '住所',
    cell: (info) => info.getValue() ?? '—',
  }),
]

function LocationCollection() {
  const navigate = useNavigate()
  const { q, page } = Route.useSearch()
  const { data, isLoading } = useLocations()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ロケーション一覧</h2>
      <DataTable
        columns={columns}
        data={data ?? []}
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
          navigate({ to: '/locations/$id', params: { id: row.id } })
        }
      />
    </div>
  )
}

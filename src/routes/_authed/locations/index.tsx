import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { LocationTypeBadge } from '#/components/StatusBadge'
import { useLocations } from '#/hooks/use-locations'
import type { Location } from '#/lib/types'

export const Route = createFileRoute('/_authed/locations/')({
  staticData: { title: 'ロケーション' },
  component: LocationCollection,
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
  const { data, isLoading } = useLocations()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ロケーション一覧</h2>
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        onRowClick={(row) =>
          navigate({ to: '/locations/$id', params: { id: row.id } })
        }
      />
    </div>
  )
}

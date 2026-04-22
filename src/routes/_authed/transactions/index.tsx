import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { TransactionTypeBadge } from '#/components/StatusBadge'
import { useLocations } from '#/lib/api/locations'
import { useTransactions } from '#/lib/api/transactions'
import type { Transaction } from '#/lib/types'

type SearchParams = { q?: string; page?: number }

export const Route = createFileRoute('/_authed/transactions/')({
  staticData: { title: '取引' },
  component: TransactionCollection,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: (search.q as string) || undefined,
    page: Number(search.page) || undefined,
  }),
})

const columnHelper = createColumnHelper<
  Transaction & { fromLocationName?: string; toLocationName?: string }
>()

const columns = [
  columnHelper.accessor('type', {
    header: 'タイプ',
    cell: (info) => <TransactionTypeBadge type={info.getValue()} />,
  }),
  columnHelper.accessor('fromLocationName', {
    header: '出荷元',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('toLocationName', {
    header: '出荷先',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('note', {
    header: 'メモ',
    cell: (info) => {
      const note = info.getValue()
      if (!note) return '—'
      return note.length > 30 ? `${note.slice(0, 30)}...` : note
    },
  }),
  columnHelper.accessor('createdAt', {
    header: '日時',
    cell: (info) => new Date(info.getValue()).toLocaleDateString('ja-JP'),
  }),
]

function TransactionCollection() {
  const navigate = useNavigate()
  const { q, page } = Route.useSearch()
  const { data: transactions, isLoading } = useTransactions()
  const { data: locations } = useLocations()

  const locationMap = new Map((locations ?? []).map((l) => [l.id, l.name]))

  const data = (transactions ?? [])
    .map((tx) => ({
      ...tx,
      fromLocationName: tx.fromLocationId
        ? locationMap.get(tx.fromLocationId)
        : undefined,
      toLocationName: tx.toLocationId
        ? locationMap.get(tx.toLocationId)
        : undefined,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">取引一覧</h2>
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
          navigate({ to: '/transactions/$id', params: { id: row.id } })
        }
      />
    </div>
  )
}

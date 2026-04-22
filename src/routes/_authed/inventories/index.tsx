import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { StockStatusBadge } from '#/components/StatusBadge'
import { useInventories } from '#/lib/api/inventories'
import { useItems } from '#/lib/api/items'
import { useLocations } from '#/lib/api/locations'
import type { Inventory } from '#/lib/types'

type SearchParams = { q?: string; page?: number }

export const Route = createFileRoute('/_authed/inventories/')({
  staticData: { title: '在庫' },
  component: InventoryCollection,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: (search.q as string) || undefined,
    page: Number(search.page) || undefined,
  }),
})

const columnHelper = createColumnHelper<
  Inventory & { itemName?: string; locationName?: string }
>()

const columns = [
  columnHelper.accessor('itemName', {
    header: '商品',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('locationName', {
    header: 'ロケーション',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('quantity', { header: '在庫数' }),
  columnHelper.accessor('safetyStock', { header: '安全在庫' }),
  columnHelper.display({
    id: 'status',
    header: 'ステータス',
    cell: (info) => (
      <StockStatusBadge
        quantity={info.row.original.quantity}
        safetyStock={info.row.original.safetyStock}
      />
    ),
  }),
]

function InventoryCollection() {
  const navigate = useNavigate()
  const { q, page } = Route.useSearch()
  const { data: inventories, isLoading } = useInventories()
  const { data: items } = useItems()
  const { data: locations } = useLocations()

  const itemMap = new Map((items ?? []).map((i) => [i.id, i.name]))
  const locationMap = new Map((locations ?? []).map((l) => [l.id, l.name]))

  const data = (inventories ?? []).map((inv) => ({
    ...inv,
    itemName: itemMap.get(inv.itemId),
    locationName: locationMap.get(inv.locationId),
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">在庫一覧</h2>
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
          navigate({ to: '/inventories/$id', params: { id: row.id } })
        }
      />
    </div>
  )
}

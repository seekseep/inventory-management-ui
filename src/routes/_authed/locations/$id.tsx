import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { DetailCard } from '#/components/DetailCard'
import { LocationTypeBadge, StockStatusBadge } from '#/components/StatusBadge'
import { useInventories } from '#/hooks/use-inventories'
import { useItems } from '#/hooks/use-items'
import { useLocation } from '#/hooks/use-locations'
import type { Inventory } from '#/lib/types'

export const Route = createFileRoute('/_authed/locations/$id')({
  staticData: { title: 'ロケーション詳細' },
  component: LocationSingle,
})

const columnHelper = createColumnHelper<Inventory & { itemName?: string }>()

const inventoryColumns = [
  columnHelper.accessor('itemName', {
    header: '商品',
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

function LocationSingle() {
  const { id } = Route.useParams()
  const { data: location, isLoading } = useLocation(id)
  const { data: inventories } = useInventories({ locationId: id })
  const { data: items } = useItems()

  const itemMap = new Map((items ?? []).map((i) => [i.id, i.name]))

  const inventoryData = (inventories ?? []).map((inv) => ({
    ...inv,
    itemName: itemMap.get(inv.itemId),
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ロケーション詳細</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard
          title="基本情報"
          isLoading={isLoading}
          fields={[
            { label: '名前', value: location?.name },
            {
              label: 'タイプ',
              value: location ? (
                <LocationTypeBadge type={location.type} />
              ) : undefined,
            },
            { label: '住所', value: location?.address ?? '—' },
            {
              label: '作成日',
              value: location
                ? new Date(location.createdAt).toLocaleDateString('ja-JP')
                : undefined,
            },
          ]}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">在庫一覧</h3>
          <DataTable columns={inventoryColumns} data={inventoryData} />
        </div>
      </div>
    </div>
  )
}

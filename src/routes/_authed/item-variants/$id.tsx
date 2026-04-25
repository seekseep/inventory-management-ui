import { Link, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { DetailCard } from '#/components/DetailCard'
import { StockStatusBadge } from '#/components/StatusBadge'
import { useInventories } from '#/lib/api/inventories'
import { useItemVariant } from '#/lib/api/item-variants'
import { useItems } from '#/lib/api/items'
import { useLocations } from '#/lib/api/locations'
import { getItemVariantOptionLabel } from '#/lib/item-variant-display'
import type { Inventory } from '#/lib/types'

export const Route = createFileRoute('/_authed/item-variants/$id')({
  staticData: { title: 'バリアント詳細' },
  component: ItemVariantSingle,
})

const columnHelper = createColumnHelper<Inventory & { locationName?: string }>()

const inventoryColumns = [
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

function ItemVariantSingle() {
  const { id } = Route.useParams()
  const { data: variant, isLoading } = useItemVariant(id)
  const { data: inventories, isLoading: isInventoryLoading } = useInventories({
    itemVariantId: id,
  })
  const { data: items } = useItems()
  const { data: locations } = useLocations()

  const item = items?.find((entry) => entry.id === variant?.itemId)
  const locationMap = new Map(
    (locations ?? []).map((location) => [location.id, location.name]),
  )
  const inventoryData = (inventories ?? []).map((inventory) => ({
    ...inventory,
    locationName: locationMap.get(inventory.locationId),
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">バリアント詳細</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard
          title="基本情報"
          isLoading={isLoading}
          fields={[
            {
              label: '商品',
              value:
                item && variant ? (
                  <Link
                    to="/items/$id"
                    params={{ id: variant.itemId }}
                    className="hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : (
                  '—'
                ),
            },
            { label: 'SKU', value: variant?.sku },
            {
              label: 'オプション',
              value: variant ? getItemVariantOptionLabel(variant) : undefined,
            },
            { label: '色', value: variant?.color ?? '—' },
            { label: 'サイズ', value: variant?.size ?? '—' },
            {
              label: '更新日',
              value: variant
                ? new Date(variant.updatedAt).toLocaleDateString('ja-JP')
                : undefined,
            },
          ]}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ロケーション別在庫</h3>
          <DataTable
            columns={inventoryColumns}
            data={inventoryData}
            isLoading={isInventoryLoading}
          />
        </div>
      </div>
    </div>
  )
}

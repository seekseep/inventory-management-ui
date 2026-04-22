import { Link, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { DetailCard } from '#/components/DetailCard'
import {
  ItemStatusBadge,
  ItemTypeBadge,
  StockStatusBadge,
} from '#/components/StatusBadge'
import { useInventories } from '#/lib/api/inventories'
import { useItemCategories } from '#/lib/api/item-categories'
import { useItem } from '#/lib/api/items'
import { useLocations } from '#/lib/api/locations'
import type { Inventory } from '#/lib/types'

export const Route = createFileRoute('/_authed/items/$id')({
  staticData: { title: '商品詳細' },
  component: ItemSingle,
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

function ItemSingle() {
  const { id } = Route.useParams()
  const { data: item, isLoading } = useItem(id)
  const { data: categories } = useItemCategories()
  const { data: inventories } = useInventories({ itemId: id })
  const { data: locations } = useLocations()

  const categoryName = item?.itemCategoryId
    ? categories?.find((c) => c.id === item.itemCategoryId)?.name
    : undefined

  const locationMap = new Map((locations ?? []).map((l) => [l.id, l.name]))

  const inventoryData = (inventories ?? []).map((inv) => ({
    ...inv,
    locationName: locationMap.get(inv.locationId),
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">商品詳細</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard
          title="基本情報"
          isLoading={isLoading}
          fields={[
            { label: '名前', value: item?.name },
            { label: 'SKU', value: item?.sku },
            { label: '説明', value: item?.description ?? '—' },
            {
              label: 'タイプ',
              value: item ? <ItemTypeBadge type={item.type} /> : undefined,
            },
            {
              label: 'ステータス',
              value: item ? (
                <ItemStatusBadge status={item.status} />
              ) : undefined,
            },
            { label: '色', value: item?.color ?? '—' },
            { label: 'サイズ', value: item?.size ?? '—' },
            { label: 'シーズン', value: item?.season ?? '—' },
            {
              label: '価格',
              value: item ? `¥${item.price.toLocaleString()}` : undefined,
            },
            {
              label: 'カテゴリ',
              value:
                categoryName && item?.itemCategoryId ? (
                  <Link
                    to="/item-categories/$id"
                    params={{ id: item.itemCategoryId }}
                    className="hover:underline"
                  >
                    {categoryName}
                  </Link>
                ) : (
                  '—'
                ),
            },
          ]}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ロケーション別在庫</h3>
          <DataTable columns={inventoryColumns} data={inventoryData} />
        </div>
      </div>
    </div>
  )
}

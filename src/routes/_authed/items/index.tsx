import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { ItemStatusBadge, ItemTypeBadge } from '#/components/StatusBadge'
import { useItemCategories } from '#/lib/api/item-categories'
import { useItems } from '#/lib/api/items'
import type { Item } from '#/lib/types'

export const Route = createFileRoute('/_authed/items/')({
  staticData: { title: '商品' },
  component: ItemCollection,
})

const columnHelper = createColumnHelper<Item & { categoryName?: string }>()

const columns = [
  columnHelper.accessor('sku', { header: 'SKU' }),
  columnHelper.accessor('name', { header: '名前' }),
  columnHelper.accessor('type', {
    header: 'タイプ',
    cell: (info) => <ItemTypeBadge type={info.getValue()} />,
  }),
  columnHelper.accessor('status', {
    header: 'ステータス',
    cell: (info) => <ItemStatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor('color', {
    header: '色',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('size', {
    header: 'サイズ',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('price', {
    header: '価格',
    cell: (info) => `¥${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('categoryName', {
    header: 'カテゴリ',
    cell: (info) => info.getValue() ?? '—',
  }),
]

function ItemCollection() {
  const navigate = useNavigate()
  const { data: items, isLoading: itemsLoading } = useItems()
  const { data: categories } = useItemCategories()

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c.name]))

  const data = (items ?? []).map((item) => ({
    ...item,
    categoryName: categoryMap.get(item.itemCategoryId),
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">商品一覧</h2>
      <DataTable
        columns={columns}
        data={data}
        isLoading={itemsLoading}
        onRowClick={(row) =>
          navigate({ to: '/items/$id', params: { id: row.id } })
        }
      />
    </div>
  )
}

import { Link, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { DetailCard } from '#/components/DetailCard'
import { ItemStatusBadge, ItemTypeBadge } from '#/components/StatusBadge'
import { useItemCategories, useItemCategory } from '#/hooks/use-item-categories'
import { useItems } from '#/hooks/use-items'
import type { Item } from '#/lib/types'

export const Route = createFileRoute('/_authed/item-categories/$id')({
  staticData: { title: 'カテゴリ詳細' },
  component: ItemCategorySingle,
})

const columnHelper = createColumnHelper<Item>()

const itemColumns = [
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
  columnHelper.accessor('price', {
    header: '価格',
    cell: (info) => `¥${info.getValue().toLocaleString()}`,
  }),
]

function ItemCategorySingle() {
  const { id } = Route.useParams()
  const { data: category, isLoading } = useItemCategory(id)
  const { data: categories } = useItemCategories()
  const { data: allItems } = useItems()

  const parentName = category?.parentId
    ? categories?.find((c) => c.id === category.parentId)?.name
    : undefined

  const categoryItems = (allItems ?? []).filter(
    (item) => item.itemCategoryId === id,
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">カテゴリ詳細</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard
          title="基本情報"
          isLoading={isLoading}
          fields={[
            { label: '名前', value: category?.name },
            { label: '説明', value: category?.description ?? '—' },
            {
              label: '親カテゴリ',
              value: parentName ? (
                <Link
                  to="/item-categories/$id"
                  params={{ id: category?.parentId ?? '' }}
                  className="hover:underline"
                >
                  {parentName}
                </Link>
              ) : (
                '—'
              ),
            },
            {
              label: '作成日',
              value: category
                ? new Date(category.createdAt).toLocaleDateString('ja-JP')
                : undefined,
            },
          ]}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">所属商品</h3>
          <DataTable columns={itemColumns} data={categoryItems} />
        </div>
      </div>
    </div>
  )
}

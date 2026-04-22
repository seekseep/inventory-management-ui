import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { useItemCategories } from '#/lib/api/item-categories'
import type { ItemCategory } from '#/lib/types'

type SearchParams = { q?: string; page?: number }

export const Route = createFileRoute('/_authed/item-categories/')({
  staticData: { title: 'カテゴリ' },
  component: ItemCategoryCollection,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: (search.q as string) || undefined,
    page: Number(search.page) || undefined,
  }),
})

const columnHelper = createColumnHelper<
  ItemCategory & { parentName?: string }
>()

const columns = [
  columnHelper.accessor('name', { header: '名前' }),
  columnHelper.accessor('description', {
    header: '説明',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('parentName', {
    header: '親カテゴリ',
    cell: (info) => info.getValue() ?? '—',
  }),
]

function ItemCategoryCollection() {
  const navigate = useNavigate()
  const { q, page } = Route.useSearch()
  const { data, isLoading } = useItemCategories()

  const categories = (data ?? []).map((cat) => ({
    ...cat,
    parentName: cat.parentId
      ? data?.find((c) => c.id === cat.parentId)?.name
      : undefined,
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">カテゴリ一覧</h2>
      <DataTable
        columns={columns}
        data={categories}
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
          navigate({ to: '/item-categories/$id', params: { id: row.id } })
        }
      />
    </div>
  )
}

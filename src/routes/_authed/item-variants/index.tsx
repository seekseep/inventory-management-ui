import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { useInventories } from '#/lib/api/inventories'
import { useItemVariants } from '#/lib/api/item-variants'
import { useItems } from '#/lib/api/items'
import { getItemVariantOptionLabel } from '#/lib/item-variant-display'
import type { ItemVariant } from '#/lib/types'

type SearchParams = { q?: string; page?: number }

export const Route = createFileRoute('/_authed/item-variants/')({
  staticData: { title: 'バリアント' },
  component: ItemVariantCollection,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: (search.q as string) || undefined,
    page: Number(search.page) || undefined,
  }),
})

const columnHelper = createColumnHelper<
  ItemVariant & {
    itemName?: string
    optionLabel: string
    totalQuantity: number
    locationCount: number
  }
>()

const columns = [
  columnHelper.accessor('itemName', {
    header: '商品',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('sku', { header: 'SKU' }),
  columnHelper.accessor('optionLabel', { header: 'オプション' }),
  columnHelper.accessor('totalQuantity', { header: '総在庫数' }),
  columnHelper.accessor('locationCount', { header: '取扱拠点数' }),
]

function ItemVariantCollection() {
  const navigate = useNavigate()
  const { q, page } = Route.useSearch()
  const { data: variants, isLoading: isVariantLoading } = useItemVariants()
  const { data: items } = useItems()
  const { data: inventories, isLoading: isInventoryLoading } = useInventories()

  const itemMap = new Map((items ?? []).map((item) => [item.id, item.name]))
  const inventoryMap = new Map<
    string,
    { totalQuantity: number; locationCount: number }
  >()

  for (const inventory of inventories ?? []) {
    const existing = inventoryMap.get(inventory.itemVariantId)
    if (existing) {
      existing.totalQuantity += inventory.quantity
      existing.locationCount += 1
      continue
    }

    inventoryMap.set(inventory.itemVariantId, {
      totalQuantity: inventory.quantity,
      locationCount: 1,
    })
  }

  const data = (variants ?? [])
    .map((variant) => ({
      ...variant,
      itemName: itemMap.get(variant.itemId),
      optionLabel: getItemVariantOptionLabel(variant),
      totalQuantity: inventoryMap.get(variant.id)?.totalQuantity ?? 0,
      locationCount: inventoryMap.get(variant.id)?.locationCount ?? 0,
    }))
    .sort((left, right) => left.sku.localeCompare(right.sku))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">バリアント一覧</h2>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isVariantLoading || isInventoryLoading}
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
          navigate({ to: '/item-variants/$id', params: { id: row.id } })
        }
      />
    </div>
  )
}

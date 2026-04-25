import { Link, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { DetailCard } from '#/components/DetailCard'
import { Badge } from '#/components/ui/badge'
import { useItemVariants } from '#/lib/api/item-variants'
import { useItems } from '#/lib/api/items'
import { useLocations } from '#/lib/api/locations'
import { useSnapshot } from '#/lib/api/snapshots'
import { getItemVariantOptionLabel } from '#/lib/item-variant-display'
import type { SnapshotItem } from '#/lib/types'

export const Route = createFileRoute('/_authed/snapshots/$id')({
  staticData: { title: '棚卸詳細' },
  component: SnapshotSingle,
})

const columnHelper = createColumnHelper<
  SnapshotItem & {
    itemName?: string
    sku?: string
    optionLabel: string
    variance: number
  }
>()

const itemColumns = [
  columnHelper.accessor('itemName', {
    header: '商品',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('sku', {
    header: 'SKU',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('optionLabel', { header: 'オプション' }),
  columnHelper.accessor('quantity', { header: '実数' }),
  columnHelper.accessor('expectedQuantity', { header: '理論値' }),
  columnHelper.accessor('variance', {
    header: '差異',
    cell: (info) => {
      const variance = info.getValue()
      if (variance === 0) {
        return <span className="text-muted-foreground">0</span>
      }
      if (variance > 0) return <Badge variant="outline">+{variance}</Badge>
      return <Badge variant="destructive">{variance}</Badge>
    },
  }),
]

function SnapshotSingle() {
  const { id } = Route.useParams()
  const { data: snapshot, isLoading } = useSnapshot(id)
  const { data: locations } = useLocations()
  const { data: items } = useItems()
  const { data: variants } = useItemVariants()

  const locationName = snapshot?.locationId
    ? locations?.find((entry) => entry.id === snapshot.locationId)?.name
    : undefined

  const itemMap = new Map((items ?? []).map((item) => [item.id, item.name]))
  const variantMap = new Map(
    (variants ?? []).map((variant) => [variant.id, variant]),
  )

  const snapshotItems = (snapshot?.items ?? []).map((snapshotItem) => {
    const variant = variantMap.get(snapshotItem.itemVariantId)
    return {
      ...snapshotItem,
      itemName: variant ? itemMap.get(variant.itemId) : undefined,
      sku: variant?.sku,
      optionLabel: variant ? getItemVariantOptionLabel(variant) : '—',
      variance: snapshotItem.quantity - snapshotItem.expectedQuantity,
    }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">棚卸詳細</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard
          title="棚卸情報"
          isLoading={isLoading}
          fields={[
            {
              label: 'ロケーション',
              value:
                locationName && snapshot?.locationId ? (
                  <Link
                    to="/locations/$id"
                    params={{ id: snapshot.locationId }}
                    className="hover:underline"
                  >
                    {locationName}
                  </Link>
                ) : (
                  '—'
                ),
            },
            { label: 'メモ', value: snapshot?.note ?? '—' },
            {
              label: '日時',
              value: snapshot
                ? new Date(snapshot.createdAt).toLocaleDateString('ja-JP')
                : undefined,
            },
            {
              label: '商品数',
              value: snapshot?.items.length ?? 0,
            },
          ]}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">明細</h3>
          <DataTable columns={itemColumns} data={snapshotItems} />
        </div>
      </div>
    </div>
  )
}

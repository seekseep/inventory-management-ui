import { Link, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '#/components/DataTable'
import { DetailCard } from '#/components/DetailCard'
import { TransactionTypeBadge } from '#/components/StatusBadge'
import { useItemVariants } from '#/lib/api/item-variants'
import { useItems } from '#/lib/api/items'
import { useLocations } from '#/lib/api/locations'
import { useTransaction } from '#/lib/api/transactions'
import { getItemVariantOptionLabel } from '#/lib/item-variant-display'
import type { TransactionItem } from '#/lib/types'

export const Route = createFileRoute('/_authed/transactions/$id')({
  staticData: { title: '取引詳細' },
  component: TransactionSingle,
})

const columnHelper = createColumnHelper<
  TransactionItem & {
    itemName?: string
    sku?: string
    optionLabel: string
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
  columnHelper.accessor('quantity', { header: '数量' }),
]

function TransactionSingle() {
  const { id } = Route.useParams()
  const { data: transaction, isLoading } = useTransaction(id)
  const { data: locations } = useLocations()
  const { data: items } = useItems()
  const { data: variants } = useItemVariants()

  const locationMap = new Map(
    (locations ?? []).map((location) => [location.id, location.name]),
  )
  const itemMap = new Map((items ?? []).map((item) => [item.id, item.name]))
  const variantMap = new Map(
    (variants ?? []).map((variant) => [variant.id, variant]),
  )

  const transactionItems = (transaction?.items ?? []).map((transactionItem) => {
    const variant = variantMap.get(transactionItem.itemVariantId)
    return {
      ...transactionItem,
      itemName: variant ? itemMap.get(variant.itemId) : undefined,
      sku: variant?.sku,
      optionLabel: variant ? getItemVariantOptionLabel(variant) : '—',
    }
  })

  const fromName = transaction?.fromLocationId
    ? locationMap.get(transaction.fromLocationId)
    : undefined
  const toName = transaction?.toLocationId
    ? locationMap.get(transaction.toLocationId)
    : undefined

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">取引詳細</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard
          title="取引情報"
          isLoading={isLoading}
          fields={[
            {
              label: 'タイプ',
              value: transaction ? (
                <TransactionTypeBadge type={transaction.type} />
              ) : undefined,
            },
            {
              label: '出荷元',
              value:
                fromName && transaction?.fromLocationId ? (
                  <Link
                    to="/locations/$id"
                    params={{ id: transaction.fromLocationId }}
                    className="hover:underline"
                  >
                    {fromName}
                  </Link>
                ) : (
                  '—'
                ),
            },
            {
              label: '出荷先',
              value:
                toName && transaction?.toLocationId ? (
                  <Link
                    to="/locations/$id"
                    params={{ id: transaction.toLocationId }}
                    className="hover:underline"
                  >
                    {toName}
                  </Link>
                ) : (
                  '—'
                ),
            },
            { label: 'メモ', value: transaction?.note ?? '—' },
            {
              label: '日時',
              value: transaction
                ? new Date(transaction.createdAt).toLocaleDateString('ja-JP')
                : undefined,
            },
          ]}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">明細</h3>
          <DataTable columns={itemColumns} data={transactionItems} />
        </div>
      </div>
    </div>
  )
}

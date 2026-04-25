import { useMemo } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DetailCard } from '#/components/DetailCard'
import { StockStatusBadge } from '#/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { useInventory } from '#/lib/api/inventories'
import { useItemVariants } from '#/lib/api/item-variants'
import { useItems } from '#/lib/api/items'
import { useLocations } from '#/lib/api/locations'
import { useTransactionsWithItems } from '#/lib/api/transactions'
import { computeStockTimeline } from '#/lib/chart-utils'
import { getItemVariantOptionLabel } from '#/lib/item-variant-display'

export const Route = createFileRoute('/_authed/inventories/$id')({
  staticData: { title: '在庫詳細' },
  component: InventorySingle,
})

function InventorySingle() {
  const { id } = Route.useParams()
  const { data: inventory, isLoading } = useInventory(id)
  const { data: variants } = useItemVariants()
  const { data: items } = useItems()
  const { data: locations } = useLocations()
  const { data: txsWithItems, isLoading: isTxLoading } =
    useTransactionsWithItems()

  const variant = variants?.find(
    (entry) => entry.id === inventory?.itemVariantId,
  )
  const item = items?.find((entry) => entry.id === variant?.itemId)
  const location = locations?.find(
    (entry) => entry.id === inventory?.locationId,
  )

  const stockTimeline = useMemo(() => {
    if (!txsWithItems || !inventory) return []
    return computeStockTimeline(
      txsWithItems,
      inventory.itemVariantId,
      inventory.locationId,
      inventory.quantity,
    )
  }, [txsWithItems, inventory])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">在庫詳細</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard
          title="在庫情報"
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
            {
              label: 'バリアント',
              value: variant ? (
                <Link
                  to="/item-variants/$id"
                  params={{ id: variant.id }}
                  className="hover:underline"
                >
                  {variant.sku}
                </Link>
              ) : (
                '—'
              ),
            },
            {
              label: 'オプション',
              value: variant ? getItemVariantOptionLabel(variant) : '—',
            },
            {
              label: 'ロケーション',
              value:
                location && inventory ? (
                  <Link
                    to="/locations/$id"
                    params={{ id: inventory.locationId }}
                    className="hover:underline"
                  >
                    {location.name}
                  </Link>
                ) : (
                  '—'
                ),
            },
            { label: '在庫数', value: inventory?.quantity },
            { label: '安全在庫', value: inventory?.safetyStock },
            {
              label: 'ステータス',
              value: inventory ? (
                <StockStatusBadge
                  quantity={inventory.quantity}
                  safetyStock={inventory.safetyStock}
                />
              ) : undefined,
            },
            {
              label: '更新日',
              value: inventory
                ? new Date(inventory.updatedAt).toLocaleDateString('ja-JP')
                : undefined,
            },
          ]}
        />
        {variant && item && (
          <DetailCard
            title="バリアント情報"
            fields={[
              { label: 'SKU', value: variant.sku },
              { label: '色', value: variant.color ?? '—' },
              { label: 'サイズ', value: variant.size ?? '—' },
              {
                label: 'オプション',
                value: getItemVariantOptionLabel(variant),
              },
              {
                label: '価格',
                value: `¥${item.price.toLocaleString()}`,
              },
            ]}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">在庫推移</CardTitle>
        </CardHeader>
        <CardContent>
          {isTxLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : stockTimeline.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              在庫推移データがありません
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stockTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="quantity"
                  name="在庫数"
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                {inventory && (
                  <ReferenceLine
                    y={inventory.safetyStock}
                    stroke="hsl(0, 84%, 60%)"
                    strokeDasharray="5 5"
                    label={{
                      value: `安全在庫: ${inventory.safetyStock}`,
                      position: 'insideTopRight',
                      fontSize: 12,
                      fill: 'hsl(0, 84%, 60%)',
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

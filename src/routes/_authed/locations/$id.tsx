import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DataTable } from '#/components/DataTable'
import { DetailCard } from '#/components/DetailCard'
import { LocationTypeBadge, StockStatusBadge } from '#/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { useInventories } from '#/lib/api/inventories'
import { useItems } from '#/lib/api/items'
import { useLocation } from '#/lib/api/locations'
import { useTransactionsWithItems } from '#/lib/api/transactions'
import { computeInventoryTimeline } from '#/lib/chart-utils'
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

const CHART_COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 84%, 60%)',
  'hsl(270, 67%, 58%)',
  'hsl(199, 89%, 48%)',
  'hsl(25, 95%, 53%)',
  'hsl(330, 81%, 60%)',
]

function LocationSingle() {
  const { id } = Route.useParams()
  const { data: location, isLoading } = useLocation(id)
  const { data: inventories } = useInventories({ locationId: id })
  const { data: items } = useItems()
  const { data: txsWithItems, isLoading: isTxLoading } =
    useTransactionsWithItems()

  const itemMap = new Map((items ?? []).map((i) => [i.id, i.name]))

  const inventoryData = (inventories ?? []).map((inv) => ({
    ...inv,
    itemName: itemMap.get(inv.itemId),
  }))

  const timelineData = useMemo(() => {
    if (!txsWithItems || !inventories) return []
    return computeInventoryTimeline(
      txsWithItems,
      id,
      inventories.map((inv) => ({
        itemId: inv.itemId,
        quantity: inv.quantity,
      })),
      itemMap,
    )
  }, [txsWithItems, inventories, id, itemMap])

  const itemNames = useMemo(() => {
    if (timelineData.length === 0) return []
    return Object.keys(timelineData[0]).filter((k) => k !== 'date')
  }, [timelineData])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ロケーション詳細</h2>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">商品別 在庫推移</CardTitle>
        </CardHeader>
        <CardContent>
          {isTxLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : timelineData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              在庫推移データがありません
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Legend />
                {itemNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

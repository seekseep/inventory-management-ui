import { useMemo } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, ArrowRightLeft, MapPin, Package } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  TransactionTypeBadge,
  StockStatusBadge,
} from '#/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useInventories } from '#/lib/api/inventories'
import { useItemVariants } from '#/lib/api/item-variants'
import { useItems } from '#/lib/api/items'
import { useLocations } from '#/lib/api/locations'
import { useTransactions } from '#/lib/api/transactions'
import { aggregateTransactionCounts } from '#/lib/chart-utils'
import { getItemVariantDisplayName } from '#/lib/item-variant-display'
import type { Transaction } from '#/lib/types'

export const Route = createFileRoute('/_authed/')({
  staticData: { title: 'ダッシュボード' },
  component: Dashboard,
})

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  isLoading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

function computeSalesRevenue(
  transactions: Transaction[],
  priceMap: Map<string, number>,
) {
  const byDate = new Map<string, number>()

  for (const tx of transactions) {
    if (tx.type !== 'sale') continue

    const date = tx.createdAt.slice(0, 10)
    let revenue = 0
    for (const item of tx.items) {
      revenue += item.quantity * (priceMap.get(item.itemVariantId) ?? 0)
    }
    byDate.set(date, (byDate.get(date) ?? 0) + revenue)
  }

  return Array.from(byDate.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((left, right) => left.date.localeCompare(right.date))
}

function Dashboard() {
  const items = useItems()
  const itemVariants = useItemVariants()
  const locations = useLocations()
  const inventories = useInventories()
  const transactions = useTransactions()

  const isLoading =
    items.isLoading ||
    itemVariants.isLoading ||
    locations.isLoading ||
    inventories.isLoading ||
    transactions.isLoading

  const locationMap = new Map(
    (locations.data ?? []).map((location) => [location.id, location.name]),
  )
  const itemMap = new Map((items.data ?? []).map((item) => [item.id, item]))
  const variantMap = new Map(
    (itemVariants.data ?? []).map((variant) => [variant.id, variant]),
  )
  const priceMap = new Map(
    (itemVariants.data ?? []).map((variant) => [
      variant.id,
      itemMap.get(variant.itemId)?.price ?? 0,
    ]),
  )
  const variantNameMap = new Map(
    (itemVariants.data ?? []).map((variant) => [
      variant.id,
      getItemVariantDisplayName(variant, itemMap.get(variant.itemId)?.name),
    ]),
  )

  const lowStockItems = (inventories.data ?? []).filter(
    (inventory) => inventory.quantity <= inventory.safetyStock,
  )

  const recentTransactions = (transactions.data ?? [])
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 5)

  const txCountData = useMemo(
    () =>
      transactions.data ? aggregateTransactionCounts(transactions.data) : [],
    [transactions.data],
  )

  const salesRevenueData = useMemo(
    () =>
      transactions.data ? computeSalesRevenue(transactions.data, priceMap) : [],
    [transactions.data, priceMap],
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ダッシュボード</h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="商品数"
          value={items.data?.length ?? 0}
          icon={Package}
          isLoading={isLoading}
        />
        <StatCard
          title="ロケーション数"
          value={locations.data?.length ?? 0}
          icon={MapPin}
          isLoading={isLoading}
        />
        <StatCard
          title="在庫アラート"
          value={lowStockItems.length}
          icon={AlertTriangle}
          isLoading={isLoading}
        />
        <StatCard
          title="取引件数"
          value={transactions.data?.length ?? 0}
          icon={ArrowRightLeft}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近の取引</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>タイプ</TableHead>
                    <TableHead>出荷元</TableHead>
                    <TableHead>出荷先</TableHead>
                    <TableHead>日時</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Link
                          to="/transactions/$id"
                          params={{ id: transaction.id }}
                        >
                          <TransactionTypeBadge type={transaction.type} />
                        </Link>
                      </TableCell>
                      <TableCell>
                        {transaction.fromLocationId
                          ? (locationMap.get(transaction.fromLocationId) ?? '—')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {transaction.toLocationId
                          ? (locationMap.get(transaction.toLocationId) ?? '—')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString(
                          'ja-JP',
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">在庫アラート</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                アラートはありません
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>バリアント</TableHead>
                    <TableHead>ロケーション</TableHead>
                    <TableHead>在庫数</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.slice(0, 10).map((inventory) => {
                    const variant = variantMap.get(inventory.itemVariantId)
                    return (
                      <TableRow key={inventory.id}>
                        <TableCell>
                          <Link
                            to="/item-variants/$id"
                            params={{ id: inventory.itemVariantId }}
                            className="hover:underline"
                          >
                            {variantNameMap.get(inventory.itemVariantId) ??
                              variant?.sku ??
                              inventory.itemVariantId}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {locationMap.get(inventory.locationId) ??
                            inventory.locationId}
                        </TableCell>
                        <TableCell>{inventory.quantity}</TableCell>
                        <TableCell>
                          <StockStatusBadge
                            quantity={inventory.quantity}
                            safetyStock={inventory.safetyStock}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">取引件数推移</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : txCountData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                取引データがありません
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={txCountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="purchase"
                    name="仕入"
                    fill="hsl(142, 71%, 45%)"
                    stackId="stack"
                  />
                  <Bar
                    dataKey="sale"
                    name="販売"
                    fill="hsl(221, 83%, 53%)"
                    stackId="stack"
                  />
                  <Bar
                    dataKey="transfer"
                    name="移動"
                    fill="hsl(45, 93%, 47%)"
                    stackId="stack"
                  />
                  <Bar
                    dataKey="disposal"
                    name="廃棄"
                    fill="hsl(0, 84%, 60%)"
                    stackId="stack"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">売上金額推移</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : salesRevenueData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                売上データがありません
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis
                    allowDecimals={false}
                    fontSize={12}
                    tickFormatter={(value) => `¥${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `¥${Number(value).toLocaleString()}`,
                      '売上',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="売上"
                    stroke="hsl(221, 83%, 53%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

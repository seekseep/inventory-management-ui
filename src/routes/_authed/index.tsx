import { useMemo } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRightLeft, AlertTriangle, MapPin, Package } from 'lucide-react'
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
import {
  TransactionTypeBadge,
  StockStatusBadge,
} from '#/components/StatusBadge'
import { useInventories } from '#/lib/api/inventories'
import { useItems } from '#/lib/api/items'
import { useLocations } from '#/lib/api/locations'
import {
  useTransactions,
  useTransactionsWithItems,
} from '#/lib/api/transactions'
import { aggregateTransactionCounts } from '#/lib/chart-utils'
import type { TransactionWithItems } from '#/lib/types'

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
  txs: TransactionWithItems[],
  priceMap: Map<string, number>,
) {
  const byDate = new Map<string, number>()
  for (const tx of txs) {
    if (tx.type !== 'sale') continue
    const date = tx.createdAt.slice(0, 10)
    let revenue = 0
    for (const item of tx.items) {
      revenue += item.quantity * (priceMap.get(item.itemId) ?? 0)
    }
    byDate.set(date, (byDate.get(date) ?? 0) + revenue)
  }
  return Array.from(byDate.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function Dashboard() {
  const items = useItems()
  const locations = useLocations()
  const inventories = useInventories()
  const transactions = useTransactions()
  const { data: txsWithItems, isLoading: isTxDetailLoading } =
    useTransactionsWithItems()

  const isLoading =
    items.isLoading ||
    locations.isLoading ||
    inventories.isLoading ||
    transactions.isLoading

  const lowStockItems = (inventories.data ?? []).filter(
    (inv) => inv.quantity <= inv.safetyStock,
  )

  const recentTransactions = (transactions.data ?? [])
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  const locationMap = new Map((locations.data ?? []).map((l) => [l.id, l.name]))
  const itemMap = new Map((items.data ?? []).map((i) => [i.id, i.name]))
  const priceMap = new Map((items.data ?? []).map((i) => [i.id, i.price]))

  const txCountData = useMemo(
    () => (txsWithItems ? aggregateTransactionCounts(txsWithItems) : []),
    [txsWithItems],
  )

  const salesRevenueData = useMemo(
    () => (txsWithItems ? computeSalesRevenue(txsWithItems, priceMap) : []),
    [txsWithItems, priceMap],
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
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
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
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Link to="/transactions/$id" params={{ id: tx.id }}>
                          <TransactionTypeBadge type={tx.type} />
                        </Link>
                      </TableCell>
                      <TableCell>
                        {tx.fromLocationId
                          ? (locationMap.get(tx.fromLocationId) ?? '—')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {tx.toLocationId
                          ? (locationMap.get(tx.toLocationId) ?? '—')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString('ja-JP')}
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
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
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
                    <TableHead>商品</TableHead>
                    <TableHead>ロケーション</TableHead>
                    <TableHead>在庫数</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.slice(0, 10).map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Link
                          to="/items/$id"
                          params={{ id: inv.itemId }}
                          className="hover:underline"
                        >
                          {itemMap.get(inv.itemId) ?? inv.itemId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {locationMap.get(inv.locationId) ?? inv.locationId}
                      </TableCell>
                      <TableCell>{inv.quantity}</TableCell>
                      <TableCell>
                        <StockStatusBadge
                          quantity={inv.quantity}
                          safetyStock={inv.safetyStock}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
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
            {isTxDetailLoading ? (
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
            {isTxDetailLoading ? (
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
                    tickFormatter={(v) => `¥${v.toLocaleString()}`}
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
                    stroke="hsl(142, 71%, 45%)"
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

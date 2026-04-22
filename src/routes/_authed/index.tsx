import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRightLeft, AlertTriangle, MapPin, Package } from 'lucide-react'
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
import { useItems } from '#/hooks/use-items'
import { useLocations } from '#/hooks/use-locations'
import { useInventories } from '#/hooks/use-inventories'
import { useTransactions } from '#/hooks/use-transactions'

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

function Dashboard() {
  const items = useItems()
  const locations = useLocations()
  const inventories = useInventories()
  const transactions = useTransactions()

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
    </div>
  )
}

import { useMemo } from 'react'
import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
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
import { DataTable } from '#/components/DataTable'
import { DetailCard } from '#/components/DetailCard'
import {
  ItemStatusBadge,
  ItemTypeBadge,
  StockStatusBadge,
} from '#/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { useInventories } from '#/lib/api/inventories'
import { useItemCategories } from '#/lib/api/item-categories'
import { useItemVariants } from '#/lib/api/item-variants'
import { useItem } from '#/lib/api/items'
import { useLocations } from '#/lib/api/locations'
import { useTransactionsWithItems } from '#/lib/api/transactions'
import {
  aggregateSalesByItem,
  aggregateTransactionsByItem,
} from '#/lib/chart-utils'
import { getItemVariantOptionLabel } from '#/lib/item-variant-display'
import type { Inventory, ItemVariant } from '#/lib/types'

export const Route = createFileRoute('/_authed/items/$id')({
  staticData: { title: '商品詳細' },
  component: ItemSingle,
})

const inventoryColumnHelper = createColumnHelper<
  Inventory & { locationName?: string }
>()
const variantColumnHelper = createColumnHelper<
  ItemVariant & {
    optionLabel: string
    totalQuantity: number
    locationCount: number
  }
>()

const inventoryColumns = [
  inventoryColumnHelper.accessor('locationName', {
    header: 'ロケーション',
    cell: (info) => info.getValue() ?? '—',
  }),
  inventoryColumnHelper.accessor('quantity', { header: '在庫数' }),
  inventoryColumnHelper.accessor('safetyStock', { header: '安全在庫' }),
  inventoryColumnHelper.display({
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

const variantColumns = [
  variantColumnHelper.accessor('sku', { header: 'SKU' }),
  variantColumnHelper.accessor('optionLabel', { header: 'オプション' }),
  variantColumnHelper.accessor('totalQuantity', { header: '総在庫数' }),
  variantColumnHelper.accessor('locationCount', { header: '取扱拠点数' }),
]

function ItemSingle() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { data: item, isLoading } = useItem(id)
  const { data: categories } = useItemCategories()
  const { data: variants, isLoading: isVariantLoading } = useItemVariants({
    itemId: id,
  })
  const { data: inventories, isLoading: isInventoryLoading } = useInventories()
  const { data: locations } = useLocations()
  const { data: txsWithItems, isLoading: isTxLoading } =
    useTransactionsWithItems()

  const categoryName = item?.itemCategoryId
    ? categories?.find((category) => category.id === item.itemCategoryId)?.name
    : undefined

  const locationMap = new Map(
    (locations ?? []).map((location) => [location.id, location.name]),
  )
  const variantIds = useMemo(
    () => new Set((variants ?? []).map((variant) => variant.id)),
    [variants],
  )

  const itemInventories = (inventories ?? []).filter((inventory) =>
    variantIds.has(inventory.itemVariantId),
  )

  const inventoryByLocation = new Map<
    string,
    Inventory & { locationName?: string }
  >()
  for (const inventory of itemInventories) {
    const existing = inventoryByLocation.get(inventory.locationId)
    if (existing) {
      existing.quantity += inventory.quantity
      existing.safetyStock += inventory.safetyStock
      continue
    }

    inventoryByLocation.set(inventory.locationId, {
      ...inventory,
      locationName: locationMap.get(inventory.locationId),
    })
  }

  const inventoryData = Array.from(inventoryByLocation.values()).sort(
    (left, right) =>
      (left.locationName ?? left.locationId).localeCompare(
        right.locationName ?? right.locationId,
      ),
  )

  const variantInventoryMap = new Map<
    string,
    { totalQuantity: number; locationCount: number }
  >()
  for (const inventory of itemInventories) {
    const existing = variantInventoryMap.get(inventory.itemVariantId)
    if (existing) {
      existing.totalQuantity += inventory.quantity
      existing.locationCount += 1
      continue
    }

    variantInventoryMap.set(inventory.itemVariantId, {
      totalQuantity: inventory.quantity,
      locationCount: 1,
    })
  }

  const variantData = (variants ?? [])
    .map((variant) => ({
      ...variant,
      optionLabel: getItemVariantOptionLabel(variant),
      totalQuantity: variantInventoryMap.get(variant.id)?.totalQuantity ?? 0,
      locationCount: variantInventoryMap.get(variant.id)?.locationCount ?? 0,
    }))
    .sort((left, right) => left.sku.localeCompare(right.sku))

  const salesData = useMemo(
    () =>
      txsWithItems && variantIds.size > 0
        ? aggregateSalesByItem(txsWithItems, variantIds)
        : [],
    [txsWithItems, variantIds],
  )

  const txByTypeData = useMemo(
    () =>
      txsWithItems && variantIds.size > 0
        ? aggregateTransactionsByItem(txsWithItems, variantIds)
        : [],
    [txsWithItems, variantIds],
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">商品詳細</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard
          title="基本情報"
          isLoading={isLoading}
          fields={[
            { label: '名前', value: item?.name },
            { label: '説明', value: item?.description ?? '—' },
            {
              label: 'タイプ',
              value: item ? <ItemTypeBadge type={item.type} /> : undefined,
            },
            {
              label: 'ステータス',
              value: item ? (
                <ItemStatusBadge status={item.status} />
              ) : undefined,
            },
            { label: 'シーズン', value: item?.season ?? '—' },
            {
              label: '価格',
              value: item ? `¥${item.price.toLocaleString()}` : undefined,
            },
            {
              label: 'カテゴリ',
              value:
                categoryName && item?.itemCategoryId ? (
                  <Link
                    to="/item-categories/$id"
                    params={{ id: item.itemCategoryId }}
                    className="hover:underline"
                  >
                    {categoryName}
                  </Link>
                ) : (
                  '—'
                ),
            },
            { label: 'バリアント数', value: variants?.length ?? 0 },
          ]}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ロケーション別在庫</h3>
          <DataTable
            columns={inventoryColumns}
            data={inventoryData}
            isLoading={isInventoryLoading}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">バリアント一覧</h3>
        <DataTable
          columns={variantColumns}
          data={variantData}
          isLoading={isVariantLoading}
          onRowClick={(row) =>
            navigate({ to: '/item-variants/$id', params: { id: row.id } })
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">売上推移</CardTitle>
          </CardHeader>
          <CardContent>
            {isTxLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : salesData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                売上データがありません
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="quantity"
                    name="販売数"
                    stroke="hsl(221, 83%, 53%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">取引タイプ別推移</CardTitle>
          </CardHeader>
          <CardContent>
            {isTxLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : txByTypeData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                取引データがありません
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={txByTypeData}>
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
                    dataKey="transfer_in"
                    name="移動（入）"
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
      </div>
    </div>
  )
}

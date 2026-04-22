import { Link, createFileRoute } from '@tanstack/react-router'
import { DetailCard } from '#/components/DetailCard'
import { StockStatusBadge } from '#/components/StatusBadge'
import { useInventory } from '#/hooks/use-inventories'
import { useItems } from '#/hooks/use-items'
import { useLocations } from '#/hooks/use-locations'

export const Route = createFileRoute('/_authed/inventories/$id')({
  staticData: { title: '在庫詳細' },
  component: InventorySingle,
})

function InventorySingle() {
  const { id } = Route.useParams()
  const { data: inventory, isLoading } = useInventory(id)
  const { data: items } = useItems()
  const { data: locations } = useLocations()

  const item = items?.find((i) => i.id === inventory?.itemId)
  const location = locations?.find((l) => l.id === inventory?.locationId)

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
                item && inventory ? (
                  <Link
                    to="/items/$id"
                    params={{ id: inventory.itemId }}
                    className="hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : (
                  '—'
                ),
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
        {item && (
          <DetailCard
            title="商品情報"
            fields={[
              { label: '名前', value: item.name },
              { label: 'SKU', value: item.sku },
              { label: '色', value: item.color ?? '—' },
              { label: 'サイズ', value: item.size ?? '—' },
              {
                label: '価格',
                value: `¥${item.price.toLocaleString()}`,
              },
            ]}
          />
        )}
      </div>
    </div>
  )
}

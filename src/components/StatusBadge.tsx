import { Badge } from '#/components/ui/badge'

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'green'
  | 'blue'
  | 'amber'
  | 'purple'
  | 'red'

const itemStatusConfig: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: '下書き', variant: 'secondary' },
  active: { label: '有効', variant: 'green' },
  on_sale: { label: 'セール中', variant: 'blue' },
  discontinued: { label: '廃止', variant: 'red' },
}

const itemTypeConfig: Record<string, { label: string; variant: BadgeVariant }> =
  {
    staple: { label: '定番', variant: 'blue' },
    seasonal: { label: 'シーズン', variant: 'amber' },
    limited: { label: '限定', variant: 'purple' },
  }

const locationTypeConfig: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  store: { label: '店舗', variant: 'blue' },
  warehouse: { label: '倉庫', variant: 'amber' },
}

const transactionTypeConfig: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  purchase: { label: '仕入', variant: 'green' },
  transfer: { label: '移動', variant: 'blue' },
  sale: { label: '販売', variant: 'amber' },
  disposal: { label: '廃棄', variant: 'red' },
}

export function ItemStatusBadge({ status }: { status: string }) {
  const config = itemStatusConfig[status] ?? {
    label: status,
    variant: 'secondary' as const,
  }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function ItemTypeBadge({ type }: { type: string }) {
  const config = itemTypeConfig[type] ?? {
    label: type,
    variant: 'secondary' as const,
  }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function LocationTypeBadge({ type }: { type: string }) {
  const config = locationTypeConfig[type] ?? {
    label: type,
    variant: 'secondary' as const,
  }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function TransactionTypeBadge({ type }: { type: string }) {
  const config = transactionTypeConfig[type] ?? {
    label: type,
    variant: 'secondary' as const,
  }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function StockStatusBadge({
  quantity,
  safetyStock,
}: {
  quantity: number
  safetyStock: number
}) {
  if (quantity === 0) {
    return <Badge variant="red">欠品</Badge>
  }
  if (quantity <= safetyStock) {
    return <Badge variant="amber">在庫少</Badge>
  }
  return <Badge variant="green">正常</Badge>
}

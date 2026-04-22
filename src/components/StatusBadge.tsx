import { Badge } from '#/components/ui/badge'

const itemStatusConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  draft: { label: '下書き', variant: 'secondary' },
  active: { label: '有効', variant: 'default' },
  on_sale: { label: 'セール中', variant: 'outline' },
  discontinued: { label: '廃止', variant: 'destructive' },
}

const itemTypeConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  staple: { label: '定番', variant: 'default' },
  seasonal: { label: 'シーズン', variant: 'secondary' },
  limited: { label: '限定', variant: 'outline' },
}

const locationTypeConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  store: { label: '店舗', variant: 'default' },
  warehouse: { label: '倉庫', variant: 'secondary' },
}

const transactionTypeConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  purchase: { label: '仕入', variant: 'default' },
  transfer: { label: '移動', variant: 'secondary' },
  sale: { label: '販売', variant: 'outline' },
  disposal: { label: '廃棄', variant: 'destructive' },
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
    return <Badge variant="destructive">欠品</Badge>
  }
  if (quantity <= safetyStock) {
    return <Badge variant="outline">在庫少</Badge>
  }
  return <Badge variant="default">正常</Badge>
}

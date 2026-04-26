import type { Transaction } from '#/lib/types'

export interface DailyQuantity {
  date: string
  quantity: number
}

export interface DailyQuantityByItem {
  date: string
  [itemVariantName: string]: number | string
}

function hasTargetVariant(
  itemVariantIds: ReadonlySet<string>,
  itemVariantId: string,
) {
  return itemVariantIds.has(itemVariantId)
}

/**
 * 特定の商品の売上数量を日別に集計する
 */
export function aggregateSalesByItem(
  transactions: Transaction[],
  itemVariantIds: ReadonlySet<string>,
): DailyQuantity[] {
  const salesByDate = new Map<string, number>()

  for (const tx of transactions) {
    if (tx.type !== 'sale') continue

    for (const item of tx.items) {
      if (!hasTargetVariant(itemVariantIds, item.itemVariantId)) continue
      const date = tx.createdAt.slice(0, 10)
      salesByDate.set(date, (salesByDate.get(date) ?? 0) + item.quantity)
    }
  }

  return Array.from(salesByDate.entries())
    .map(([date, quantity]) => ({ date, quantity }))
    .sort((left, right) => left.date.localeCompare(right.date))
}

/**
 * 特定の商品の取引タイプ別数量を日別に集計する
 */
export function aggregateTransactionsByItem(
  transactions: Transaction[],
  itemVariantIds: ReadonlySet<string>,
): {
  date: string
  purchase: number
  sale: number
  transfer_in: number
  transfer_out: number
  disposal: number
}[] {
  const byDate = new Map<
    string,
    {
      purchase: number
      sale: number
      transfer_in: number
      transfer_out: number
      disposal: number
    }
  >()

  for (const tx of transactions) {
    for (const item of tx.items) {
      if (!hasTargetVariant(itemVariantIds, item.itemVariantId)) continue

      const date = tx.createdAt.slice(0, 10)
      const entry = byDate.get(date) ?? {
        purchase: 0,
        sale: 0,
        transfer_in: 0,
        transfer_out: 0,
        disposal: 0,
      }

      switch (tx.type) {
        case 'purchase':
          entry.purchase += item.quantity
          break
        case 'sale':
          entry.sale += item.quantity
          break
        case 'transfer':
          if (tx.toLocationId) entry.transfer_in += item.quantity
          if (tx.fromLocationId) entry.transfer_out += item.quantity
          break
        case 'disposal':
          entry.disposal += item.quantity
          break
      }

      byDate.set(date, entry)
    }
  }

  return Array.from(byDate.entries())
    .map(([date, values]) => ({ date, ...values }))
    .sort((left, right) => left.date.localeCompare(right.date))
}

/**
 * 特定のロケーションの商品ごとの在庫推移を計算する
 * トランザクションから現在在庫までの逆算で推移を復元
 */
export function computeInventoryTimeline(
  transactions: Transaction[],
  locationId: string,
  currentInventories: { itemVariantId: string; quantity: number }[],
  itemVariantNames: Map<string, string>,
): { date: string; [itemVariantName: string]: number | string }[] {
  const relevantTransactions = transactions
    .filter(
      (tx) =>
        tx.fromLocationId === locationId || tx.toLocationId === locationId,
    )
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))

  const currentQuantities = new Map<string, number>()
  for (const inventory of currentInventories) {
    currentQuantities.set(inventory.itemVariantId, inventory.quantity)
  }

  const deltaByDate = new Map<string, Map<string, number>>()
  for (const tx of relevantTransactions) {
    const date = tx.createdAt.slice(0, 10)
    if (!deltaByDate.has(date)) deltaByDate.set(date, new Map())
    const dailyDelta = deltaByDate.get(date)!

    for (const item of tx.items) {
      let delta = 0
      if (tx.toLocationId === locationId) delta += item.quantity
      if (tx.fromLocationId === locationId) delta -= item.quantity
      dailyDelta.set(
        item.itemVariantId,
        (dailyDelta.get(item.itemVariantId) ?? 0) + delta,
      )
    }
  }

  const dates = Array.from(deltaByDate.keys()).sort()
  if (dates.length === 0) return []

  const allVariantIds = new Set<string>()
  for (const inventory of currentInventories) {
    allVariantIds.add(inventory.itemVariantId)
  }
  for (const [, dailyDelta] of deltaByDate) {
    for (const itemVariantId of dailyDelta.keys()) {
      allVariantIds.add(itemVariantId)
    }
  }

  const totalDeltas = new Map<string, number>()
  for (const itemVariantId of allVariantIds) totalDeltas.set(itemVariantId, 0)
  for (const [, dailyDelta] of deltaByDate) {
    for (const [itemVariantId, delta] of dailyDelta) {
      totalDeltas.set(
        itemVariantId,
        (totalDeltas.get(itemVariantId) ?? 0) + delta,
      )
    }
  }

  const startingQuantities = new Map<string, number>()
  for (const itemVariantId of allVariantIds) {
    startingQuantities.set(
      itemVariantId,
      (currentQuantities.get(itemVariantId) ?? 0) -
        (totalDeltas.get(itemVariantId) ?? 0),
    )
  }

  const result: { date: string; [key: string]: number | string }[] = []
  const runningQuantities = new Map<string, number>(startingQuantities)

  for (const date of dates) {
    const dailyDelta = deltaByDate.get(date)!
    for (const [itemVariantId, delta] of dailyDelta) {
      runningQuantities.set(
        itemVariantId,
        (runningQuantities.get(itemVariantId) ?? 0) + delta,
      )
    }

    const point: { date: string; [key: string]: number | string } = { date }
    for (const itemVariantId of allVariantIds) {
      const label = itemVariantNames.get(itemVariantId) ?? itemVariantId
      point[label] = runningQuantities.get(itemVariantId) ?? 0
    }
    result.push(point)
  }

  return result
}

/**
 * 特定のバリアント×ロケーションの在庫推移を計算する
 */
export function computeStockTimeline(
  transactions: Transaction[],
  itemVariantId: string,
  locationId: string,
  currentQuantity: number,
): DailyQuantity[] {
  const relevantTransactions = transactions
    .filter(
      (tx) =>
        tx.fromLocationId === locationId || tx.toLocationId === locationId,
    )
    .filter((tx) =>
      tx.items.some((item) => item.itemVariantId === itemVariantId),
    )
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))

  const deltaByDate = new Map<string, number>()
  for (const tx of relevantTransactions) {
    const date = tx.createdAt.slice(0, 10)
    for (const item of tx.items) {
      if (item.itemVariantId !== itemVariantId) continue
      let delta = 0
      if (tx.toLocationId === locationId) delta += item.quantity
      if (tx.fromLocationId === locationId) delta -= item.quantity
      deltaByDate.set(date, (deltaByDate.get(date) ?? 0) + delta)
    }
  }

  const dates = Array.from(deltaByDate.keys()).sort()
  if (dates.length === 0) return []

  const totalDelta = Array.from(deltaByDate.values()).reduce(
    (sum, delta) => sum + delta,
    0,
  )
  let runningQuantity = currentQuantity - totalDelta

  const result: DailyQuantity[] = []
  for (const date of dates) {
    runningQuantity += deltaByDate.get(date) ?? 0
    result.push({ date, quantity: runningQuantity })
  }

  return result
}

/**
 * 日別の取引件数を集計する
 */
export function aggregateTransactionCounts(
  transactions: Transaction[],
): {
  date: string
  purchase: number
  sale: number
  transfer: number
  disposal: number
}[] {
  const byDate = new Map<
    string,
    { purchase: number; sale: number; transfer: number; disposal: number }
  >()

  for (const tx of transactions) {
    const date = tx.createdAt.slice(0, 10)
    const entry = byDate.get(date) ?? {
      purchase: 0,
      sale: 0,
      transfer: 0,
      disposal: 0,
    }
    entry[tx.type] += 1
    byDate.set(date, entry)
  }

  return Array.from(byDate.entries())
    .map(([date, values]) => ({ date, ...values }))
    .sort((left, right) => left.date.localeCompare(right.date))
}

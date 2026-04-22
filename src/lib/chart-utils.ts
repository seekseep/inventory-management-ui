import type { TransactionWithItems } from '#/lib/types'

export interface DailyQuantity {
  date: string
  quantity: number
}

export interface DailyQuantityByItem {
  date: string
  [itemId: string]: number | string
}

/**
 * 特定の商品の売上数量を日別に集計する
 */
export function aggregateSalesByItem(
  transactions: TransactionWithItems[],
  itemId: string,
): DailyQuantity[] {
  const salesByDate = new Map<string, number>()

  for (const tx of transactions) {
    if (tx.type !== 'sale') continue
    for (const item of tx.items) {
      if (item.itemId !== itemId) continue
      const date = tx.createdAt.slice(0, 10)
      salesByDate.set(date, (salesByDate.get(date) ?? 0) + item.quantity)
    }
  }

  return Array.from(salesByDate.entries())
    .map(([date, quantity]) => ({ date, quantity }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * 特定の商品の取引タイプ別数量を日別に集計する
 */
export function aggregateTransactionsByItem(
  transactions: TransactionWithItems[],
  itemId: string,
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
      if (item.itemId !== itemId) continue
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
          entry.transfer_in += item.quantity
          break
        case 'disposal':
          entry.disposal += item.quantity
          break
      }
      byDate.set(date, entry)
    }
  }

  return Array.from(byDate.entries())
    .map(([date, vals]) => ({ date, ...vals }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * 特定のロケーションの商品ごとの在庫推移を計算する
 * トランザクションから現在在庫までの逆算で推移を復元
 */
export function computeInventoryTimeline(
  transactions: TransactionWithItems[],
  locationId: string,
  currentInventories: { itemId: string; quantity: number }[],
  itemNames: Map<string, string>,
): { date: string; [itemName: string]: number | string }[] {
  // 対象ロケーションに関連するトランザクションを時系列でソート
  const relevantTxs = transactions
    .filter(
      (tx) =>
        tx.fromLocationId === locationId || tx.toLocationId === locationId,
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  // 現在の在庫をベースに、対象商品を特定
  const currentQty = new Map<string, number>()
  for (const inv of currentInventories) {
    currentQty.set(inv.itemId, inv.quantity)
  }

  // 各トランザクションの日付ごとの在庫変動を計算
  const deltaByDate = new Map<string, Map<string, number>>()
  for (const tx of relevantTxs) {
    const date = tx.createdAt.slice(0, 10)
    if (!deltaByDate.has(date)) deltaByDate.set(date, new Map())
    const dayDelta = deltaByDate.get(date)!

    for (const item of tx.items) {
      let delta = 0
      if (tx.toLocationId === locationId) {
        // 入庫: purchase, transfer(to)
        delta = item.quantity
      }
      if (tx.fromLocationId === locationId) {
        // 出庫: sale, transfer(from), disposal
        delta = -item.quantity
      }
      dayDelta.set(item.itemId, (dayDelta.get(item.itemId) ?? 0) + delta)
    }
  }

  // 日付リストをソート
  const dates = Array.from(deltaByDate.keys()).sort()
  if (dates.length === 0) return []

  // 現在在庫から逆算して各日の在庫を復元
  const allItemIds = new Set<string>()
  for (const inv of currentInventories) allItemIds.add(inv.itemId)
  for (const [, dayDelta] of deltaByDate) {
    for (const itemId of dayDelta.keys()) allItemIds.add(itemId)
  }

  // 各日の累積変動を計算
  const cumulativeDeltas = new Map<string, number>()
  for (const itemId of allItemIds) cumulativeDeltas.set(itemId, 0)

  // 全トランザクションの合計変動
  const totalDeltas = new Map<string, number>()
  for (const itemId of allItemIds) totalDeltas.set(itemId, 0)
  for (const [, dayDelta] of deltaByDate) {
    for (const [itemId, delta] of dayDelta) {
      totalDeltas.set(itemId, (totalDeltas.get(itemId) ?? 0) + delta)
    }
  }

  // 最初の日の在庫 = 現在在庫 - 全変動合計
  const startQty = new Map<string, number>()
  for (const itemId of allItemIds) {
    startQty.set(
      itemId,
      (currentQty.get(itemId) ?? 0) - (totalDeltas.get(itemId) ?? 0),
    )
  }

  // 日別の在庫推移データを構築
  const result: { date: string; [key: string]: number | string }[] = []
  const runningQty = new Map<string, number>(startQty)

  for (const date of dates) {
    const dayDelta = deltaByDate.get(date)!
    for (const [itemId, delta] of dayDelta) {
      runningQty.set(itemId, (runningQty.get(itemId) ?? 0) + delta)
    }

    const point: { date: string; [key: string]: number | string } = { date }
    for (const itemId of allItemIds) {
      const name = itemNames.get(itemId) ?? itemId
      point[name] = runningQty.get(itemId) ?? 0
    }
    result.push(point)
  }

  return result
}

/**
 * 特定の商品×ロケーションの在庫推移を計算する
 */
export function computeStockTimeline(
  transactions: TransactionWithItems[],
  itemId: string,
  locationId: string,
  currentQuantity: number,
): DailyQuantity[] {
  const relevantTxs = transactions
    .filter(
      (tx) =>
        tx.fromLocationId === locationId || tx.toLocationId === locationId,
    )
    .filter((tx) => tx.items.some((item) => item.itemId === itemId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const deltaByDate = new Map<string, number>()
  for (const tx of relevantTxs) {
    const date = tx.createdAt.slice(0, 10)
    for (const item of tx.items) {
      if (item.itemId !== itemId) continue
      let delta = 0
      if (tx.toLocationId === locationId) delta = item.quantity
      if (tx.fromLocationId === locationId) delta = -item.quantity
      deltaByDate.set(date, (deltaByDate.get(date) ?? 0) + delta)
    }
  }

  const dates = Array.from(deltaByDate.keys()).sort()
  if (dates.length === 0) return []

  const totalDelta = Array.from(deltaByDate.values()).reduce(
    (sum, d) => sum + d,
    0,
  )
  let running = currentQuantity - totalDelta

  const result: DailyQuantity[] = []
  for (const date of dates) {
    running += deltaByDate.get(date) ?? 0
    result.push({ date, quantity: running })
  }

  return result
}

/**
 * 日別の取引件数を集計する
 */
export function aggregateTransactionCounts(
  transactions: TransactionWithItems[],
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
    .map(([date, vals]) => ({ date, ...vals }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

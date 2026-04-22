export interface ItemCategory {
  id: string
  parentId: string | null
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Item {
  id: string
  name: string
  sku: string
  description: string | null
  color: string | null
  size: string | null
  type: 'staple' | 'seasonal' | 'limited'
  status: 'draft' | 'active' | 'on_sale' | 'discontinued'
  season: string | null
  price: number
  itemCategoryId: string
  createdAt: string
  updatedAt: string
}

export interface Location {
  id: string
  name: string
  type: 'store' | 'warehouse'
  address: string | null
  createdAt: string
  updatedAt: string
}

export interface Inventory {
  id: string
  itemId: string
  locationId: string
  quantity: number
  safetyStock: number
  updatedAt: string
}

export interface TransactionItem {
  id: string
  transactionId: string
  itemId: string
  quantity: number
}

export interface Transaction {
  id: string
  fromLocationId: string | null
  toLocationId: string | null
  type: 'purchase' | 'transfer' | 'sale' | 'disposal'
  note: string | null
  createdAt: string
}

export interface TransactionWithItems extends Transaction {
  items: TransactionItem[]
}

export interface SnapshotItem {
  id: string
  snapshotId: string
  itemId: string
  quantity: number
  expectedQuantity: number
}

export interface Snapshot {
  id: string
  locationId: string
  note: string | null
  createdAt: string
}

export interface SnapshotWithItems extends Snapshot {
  items: SnapshotItem[]
}

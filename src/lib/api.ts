import { apiGet, apiGetWithKey } from '#/lib/api-client'
import type {
  Inventory,
  Item,
  ItemCategory,
  Location,
  Snapshot,
  SnapshotWithItems,
  Transaction,
  TransactionWithItems,
} from '#/lib/types'

// Auth
export async function validateApiKey(key: string): Promise<boolean> {
  try {
    await apiGetWithKey<Location[]>('/api/locations', key)
    return true
  } catch {
    return false
  }
}

// Item Categories
export function getItemCategories() {
  return apiGet<ItemCategory[]>('/api/item-categories')
}

export function getItemCategory(id: string) {
  return apiGet<ItemCategory>(`/api/item-categories/${id}`)
}

// Items
export function getItems() {
  return apiGet<Item[]>('/api/items')
}

export function getItem(id: string) {
  return apiGet<Item>(`/api/items/${id}`)
}

// Locations
export function getLocations() {
  return apiGet<Location[]>('/api/locations')
}

export function getLocation(id: string) {
  return apiGet<Location>(`/api/locations/${id}`)
}

// Inventories
export function getInventories(params?: {
  locationId?: string
  itemId?: string
}) {
  const queryParams: Record<string, string> = {}
  if (params?.locationId) queryParams.locationId = params.locationId
  if (params?.itemId) queryParams.itemId = params.itemId
  return apiGet<Inventory[]>('/api/inventories', queryParams)
}

export function getInventory(id: string) {
  return apiGet<Inventory>(`/api/inventories/${id}`)
}

// Transactions
export function getTransactions() {
  return apiGet<Transaction[]>('/api/transactions')
}

export function getTransaction(id: string) {
  return apiGet<TransactionWithItems>(`/api/transactions/${id}`)
}

// Snapshots
export function getSnapshots() {
  return apiGet<Snapshot[]>('/api/snapshots')
}

export function getSnapshot(id: string) {
  return apiGet<SnapshotWithItems>(`/api/snapshots/${id}`)
}

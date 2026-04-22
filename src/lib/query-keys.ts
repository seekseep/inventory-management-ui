export const itemCategoryKeys = {
  all: ['item-categories'] as const,
  list: () => [...itemCategoryKeys.all, 'list'] as const,
  detail: (id: string) => [...itemCategoryKeys.all, 'detail', id] as const,
}

export const itemKeys = {
  all: ['items'] as const,
  list: () => [...itemKeys.all, 'list'] as const,
  detail: (id: string) => [...itemKeys.all, 'detail', id] as const,
}

export const locationKeys = {
  all: ['locations'] as const,
  list: () => [...locationKeys.all, 'list'] as const,
  detail: (id: string) => [...locationKeys.all, 'detail', id] as const,
}

export const inventoryKeys = {
  all: ['inventories'] as const,
  list: (params?: { locationId?: string; itemId?: string }) =>
    [...inventoryKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...inventoryKeys.all, 'detail', id] as const,
}

export const transactionKeys = {
  all: ['transactions'] as const,
  list: () => [...transactionKeys.all, 'list'] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
}

export const snapshotKeys = {
  all: ['snapshots'] as const,
  list: () => [...snapshotKeys.all, 'list'] as const,
  detail: (id: string) => [...snapshotKeys.all, 'detail', id] as const,
}

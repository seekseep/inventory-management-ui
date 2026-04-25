import type { Item, ItemVariant } from '#/lib/types'

export function getItemVariantOptionLabel(
  variant: Pick<ItemVariant, 'color' | 'size'>,
) {
  const options = [variant.color, variant.size].filter(Boolean)
  return options.length > 0 ? options.join(' / ') : 'オプションなし'
}

export function getItemVariantDisplayName(
  variant: Pick<ItemVariant, 'color' | 'size' | 'sku'>,
  itemName?: string,
) {
  const optionLabel = getItemVariantOptionLabel(variant)
  return itemName
    ? `${itemName} / ${optionLabel}`
    : `${variant.sku} / ${optionLabel}`
}

export function createItemMap(items: Item[] | undefined) {
  return new Map((items ?? []).map((item) => [item.id, item]))
}

export function createItemVariantMap(variants: ItemVariant[] | undefined) {
  return new Map((variants ?? []).map((variant) => [variant.id, variant]))
}

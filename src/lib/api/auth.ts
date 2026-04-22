import { apiGetWithKey } from '#/lib/api-client'
import type { Location } from '#/lib/types'

export async function validateApiKey(key: string): Promise<boolean> {
  try {
    await apiGetWithKey<Location[]>('/api/locations', key)
    return true
  } catch {
    return false
  }
}

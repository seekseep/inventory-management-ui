export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787'

export const API_KEY_STORAGE_KEY = 'inventory-api-key'

export const API_KEY_HEADER = 'X-API-Key'

export const DEFAULT_STALE_TIME = 5 * 60 * 1000

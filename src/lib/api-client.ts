import { clearApiKey, getApiKey } from '#/lib/auth'
import { API_BASE_URL, API_KEY_HEADER } from '#/lib/constants'

export const API_UNAUTHORIZED_EVENT = 'api:unauthorized'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(path, API_BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value)
      }
    }
  }

  const apiKey = getApiKey()
  const res = await fetch(url.toString(), {
    headers: {
      ...(apiKey ? { [API_KEY_HEADER]: apiKey } : {}),
    },
  })

  if (!res.ok) {
    if (res.status === 401) {
      clearApiKey()
      window.dispatchEvent(new Event(API_UNAUTHORIZED_EVENT))
    }
    const body = await res.text()
    throw new ApiError(res.status, body)
  }

  return res.json() as Promise<T>
}

export async function apiGetWithKey<T>(
  path: string,
  apiKey: string,
): Promise<T> {
  const url = new URL(path, API_BASE_URL)
  const res = await fetch(url.toString(), {
    headers: { [API_KEY_HEADER]: apiKey },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new ApiError(res.status, body)
  }

  return res.json() as Promise<T>
}

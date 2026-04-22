import { getApiKey } from '#/lib/auth'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787'
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(path, getBaseUrl())
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
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new ApiError(res.status, body)
  }

  return res.json() as Promise<T>
}

export async function apiGetWithKey<T>(
  path: string,
  apiKey: string,
): Promise<T> {
  const url = new URL(path, getBaseUrl())
  const res = await fetch(url.toString(), {
    headers: { 'X-API-Key': apiKey },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new ApiError(res.status, body)
  }

  return res.json() as Promise<T>
}

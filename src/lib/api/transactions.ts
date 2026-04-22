import { useQuery } from '@tanstack/react-query'
import { apiGet } from '#/lib/api-client'
import { DEFAULT_STALE_TIME } from '#/lib/constants'
import type { Transaction, TransactionWithItems } from '#/lib/types'

export function getTransactions() {
  return apiGet<Transaction[]>('/api/transactions')
}

export function getTransaction(id: string) {
  return apiGet<TransactionWithItems>(`/api/transactions/${id}`)
}

export const transactionKeys = {
  all: ['transactions'] as const,
  list: () => [...transactionKeys.all, 'list'] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
}

export function useTransactions() {
  return useQuery({
    queryKey: transactionKeys.list(),
    queryFn: getTransactions,
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    staleTime: DEFAULT_STALE_TIME,
  })
}

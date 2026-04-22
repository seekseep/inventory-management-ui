import { useQuery } from '@tanstack/react-query'
import { getTransaction, getTransactions } from '#/lib/api'
import { transactionKeys } from '#/lib/query-keys'

export function useTransactions() {
  return useQuery({
    queryKey: transactionKeys.list(),
    queryFn: getTransactions,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    staleTime: 5 * 60 * 1000,
  })
}

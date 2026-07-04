import {
  getRentCollectionSummary,
  getReceivablesAging,
  getRentCollectionForecast,
} from '@/server/invoices'
import { useQuery } from '@tanstack/react-query'

export function useRentCollectionSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['rent-collection-summary', startDate, endDate],
    queryFn: () => getRentCollectionSummary(startDate, endDate),
  })
}

export function useReceivablesAging() {
  return useQuery({
    queryKey: ['receivables-aging'],
    queryFn: () => getReceivablesAging(),
  })
}

export function useRentCollectionForecast() {
  return useQuery({
    queryKey: ['rent-collection-forecast'],
    queryFn: () => getRentCollectionForecast(),
  })
}

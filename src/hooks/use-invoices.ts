import {
  getRentCollectionSummary,
  getReceivablesAging,
  getRentCollectionForecast,
} from '@/server/invoices'
import { useQuery } from '@tanstack/react-query'
import type { DashboardPeriod } from '@/lib/generatorStats'

export function useRentCollectionSummary(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['rent-collection-summary', period],
    queryFn: () => getRentCollectionSummary(period),
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

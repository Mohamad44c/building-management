'use client'

import { useQuery } from '@tanstack/react-query'
import { getPaymentsByBuilding } from '@/server/expenses'

export function usePayments(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['payments-by-building', startDate, endDate],
    queryFn: () => getPaymentsByBuilding(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

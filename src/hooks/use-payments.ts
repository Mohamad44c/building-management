'use client'

import { useQuery } from '@tanstack/react-query'
import { getPaymentsByBuilding } from '@/server/expenses'

export function usePayments() {
  return useQuery({
    queryKey: ['payments-by-building'],
    queryFn: getPaymentsByBuilding,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

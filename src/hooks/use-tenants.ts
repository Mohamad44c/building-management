'use client'

import { useQuery } from '@tanstack/react-query'
import { getTenantsByBuilding } from '@/server/expenses'

export function useTenants() {
  return useQuery({
    queryKey: ['tenants-by-building'],
    queryFn: getTenantsByBuilding,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

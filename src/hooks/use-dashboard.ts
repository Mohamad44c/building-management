'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { dayKey } from '@/lib/businessTime'
import type { DashboardDateFilterValue } from '@/lib/dashboardDateFilter'
import { dashboardKeys } from '@/lib/dashboardQueryKeys'
import { getDashboardOverview, getDashboardPeriodData } from '@/server/dashboard'

export function useDashboardPeriod(filter: DashboardDateFilterValue) {
  return useQuery({
    queryKey: dashboardKeys.period(filter, dayKey(new Date())),
    queryFn: () => getDashboardPeriodData(filter),
    // Keep showing the previous period while the next one loads instead of flashing skeletons.
    placeholderData: keepPreviousData,
  })
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardKeys.overview(dayKey(new Date())),
    queryFn: () => getDashboardOverview(),
  })
}

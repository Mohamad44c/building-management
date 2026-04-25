import { getGeneratorDashboardStats } from '@/server/expenses'
import type { DashboardPeriod } from '@/lib/generatorStats'
import { useQuery } from '@tanstack/react-query'

export const useGeneratorDashboardStats = (period: DashboardPeriod) => {
  return useQuery({
    queryKey: ['generator-dashboard-stats', period],
    queryFn: () => getGeneratorDashboardStats(period),
  })
}

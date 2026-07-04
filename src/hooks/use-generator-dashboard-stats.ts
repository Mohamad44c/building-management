import { getGeneratorDashboardStats } from '@/server/expenses'
import { useQuery } from '@tanstack/react-query'

export const useGeneratorDashboardStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['generator-dashboard-stats', startDate, endDate],
    queryFn: () => getGeneratorDashboardStats(startDate, endDate),
  })
}

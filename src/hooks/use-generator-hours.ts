import { getGeneratorHoursByDay } from '@/server/expenses'
import { useQuery } from '@tanstack/react-query'

export function useGeneratorHoursByDay(monthIndex?: number) {
  return useQuery({
    queryKey: ['generator-hours-by-day', monthIndex],
    queryFn: () => getGeneratorHoursByDay('month', monthIndex),
  })
}

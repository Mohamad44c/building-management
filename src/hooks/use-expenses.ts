import { getExpensesByDateRange, getGeneratorExpensesByDateRange } from '@/server/expenses'
import { useQuery } from '@tanstack/react-query'
import type { DateRange } from '@/components/ui/date-range-filter'

export function useExpenses(range: DateRange) {
  return useQuery({
    queryKey: ['expenses', range],
    queryFn: () => getExpensesByDateRange(range),
  })
}

export function useGeneratorExpenses(range: DateRange) {
  return useQuery({
    queryKey: ['generator-expenses', range],
    queryFn: () => getGeneratorExpensesByDateRange(range),
  })
}

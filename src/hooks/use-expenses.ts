import { getExpensesByDateRange, getDieselExpensesByDateRange } from '@/server/expenses'
import { useQuery } from '@tanstack/react-query'
import type { DateRange } from '@/components/ui/date-range-filter'

export function useExpenses(range: DateRange) {
  return useQuery({
    queryKey: ['expenses', range],
    queryFn: () => getExpensesByDateRange(range),
  })
}

export function useDieselExpenses(range: DateRange) {
  return useQuery({
    queryKey: ['diesel-expenses', range],
    queryFn: () => getDieselExpensesByDateRange(range),
  })
}

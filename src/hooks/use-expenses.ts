import {
  getExpensesByDateRange,
  getDieselExpensesByDateRange,
  getGeneratorExpensesByDateRange,
  getGeneratorExpensesByCategory,
} from '@/server/expenses'
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

export function useGeneratorExpenses(range: DateRange) {
  return useQuery({
    queryKey: ['generator-expenses', range],
    queryFn: () => getGeneratorExpensesByDateRange(range),
  })
}

export function useGeneratorExpensesByCategory(range: DateRange) {
  return useQuery({
    queryKey: ['generator-expenses-by-category', range],
    queryFn: () => getGeneratorExpensesByCategory(range),
  })
}

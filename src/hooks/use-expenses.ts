import {
  getExpensesByDateRange,
  getDieselExpensesByDateRange,
  getGeneratorExpensesByDateRange,
  getGeneratorExpensesByCategory,
} from '@/server/expenses'
import { useQuery } from '@tanstack/react-query'
import type { DateRange } from '@/components/ui/date-range-filter'

export function useExpenses(monthIndex?: number) {
  return useQuery({
    queryKey: ['expenses', monthIndex],
    queryFn: () => getExpensesByDateRange('month', monthIndex),
  })
}

export function useDieselExpenses(monthIndex?: number) {
  return useQuery({
    queryKey: ['diesel-expenses', monthIndex],
    queryFn: () => getDieselExpensesByDateRange('month', monthIndex),
  })
}

export function useGeneratorExpenses(monthIndex?: number) {
  return useQuery({
    queryKey: ['generator-expenses', monthIndex],
    queryFn: () => getGeneratorExpensesByDateRange('month', monthIndex),
  })
}

export function useGeneratorExpensesByCategory(monthIndex?: number) {
  return useQuery({
    queryKey: ['generator-expenses-by-category', monthIndex],
    queryFn: () => getGeneratorExpensesByCategory('month', monthIndex),
  })
}

import {
  getExpensesByDateRange,
  getDieselExpensesByDateRange,
  getGeneratorExpensesByDateRange,
  getGeneratorExpensesByCategory,
  getDieselOutstandingSummary,
  getExpensesByCategory,
  getDieselPriceForecast,
  getGeneratorMaintenanceForecast,
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

export function useDieselExpensesByDateRange(range: DateRange, monthIndex?: number) {
  return useQuery({
    queryKey: ['diesel-expenses-by-range', range, monthIndex ?? null],
    queryFn: () => getDieselExpensesByDateRange(range, monthIndex),
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

export function useDieselOutstandingSummary() {
  return useQuery({
    queryKey: ['diesel-outstanding-summary'],
    queryFn: () => getDieselOutstandingSummary(),
  })
}

export function useExpensesByCategory(range: DateRange, monthIndex?: number) {
  return useQuery({
    queryKey: ['expenses-by-category', range, monthIndex ?? null],
    queryFn: () => getExpensesByCategory(range, monthIndex),
  })
}

export function useDieselPriceForecast() {
  return useQuery({
    queryKey: ['diesel-price-forecast'],
    queryFn: () => getDieselPriceForecast(),
  })
}

export function useGeneratorMaintenanceForecast() {
  return useQuery({
    queryKey: ['generator-maintenance-forecast'],
    queryFn: () => getGeneratorMaintenanceForecast(),
  })
}

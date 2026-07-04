import {
  getExpensesByDateRange,
  getGeneratorExpensesByDateRange,
  getGeneratorExpensesByCategory,
  getDieselOutstandingSummary,
  getDieselExpensesInRange,
  getExpensesByCategory,
  getDieselPriceForecast,
  getGeneratorMaintenanceForecast,
} from '@/server/expenses'
import { useQuery } from '@tanstack/react-query'

export function useExpenses(monthIndex?: number) {
  return useQuery({
    queryKey: ['expenses', monthIndex],
    queryFn: () => getExpensesByDateRange('month', monthIndex),
  })
}

export function useDieselExpensesInRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['diesel-expenses-in-range', startDate, endDate],
    queryFn: () => getDieselExpensesInRange(startDate, endDate),
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

export function useExpensesByCategory(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['expenses-by-category', startDate, endDate],
    queryFn: () => getExpensesByCategory(startDate, endDate),
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

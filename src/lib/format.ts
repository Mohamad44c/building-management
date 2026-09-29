import { BUSINESS_TIME_ZONE } from '@/lib/businessTime'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const currencyCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const number1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export const formatCurrency = (value: number) => currency.format(value)
/** Axis ticks: $1.2K, $950. */
export const formatCurrencyCompact = (value: number) => currencyCompact.format(value)
export const formatNumber = (value: number) => number1.format(value)
export const formatInteger = (value: number) => integer.format(value)
export const formatHours = (value: number) => `${number1.format(value)} h`
export const formatLiters = (value: number) => `${integer.format(value)} L`
export const formatPricePerLiter = (value: number) => `$${value.toFixed(3)}/L`
export const formatPercent = (value: number) => `${number1.format(value)}%`

/** Formats a `YYYY-MM-DD` business day key or an ISO instant as a business-calendar date. */
export function formatDay(value: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' })
  }
  return new Date(value).toLocaleDateString('en-US', { ...options, timeZone: BUSINESS_TIME_ZONE })
}

/** Formats a `YYYY-MM` month key, e.g. "Sep 2026". */
export function formatMonthKey(key: string, month: 'short' | 'long' = 'short') {
  const [y, m] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month, year: 'numeric', timeZone: 'UTC' })
}

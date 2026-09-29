import {
  BUSINESS_TIME_ZONE,
  daysInMonth,
  monthKeyOf,
  zonedEndOfDay,
  zonedParts,
  zonedStartOfMonth,
} from '@/lib/businessTime'

export type DashboardDateFilterPreset = 'this-month' | 'last-month' | 'last-3-months' | 'year-to-date'

export type DashboardDateFilterValue =
  | { mode: 'preset'; preset: DashboardDateFilterPreset }
  | { mode: 'month'; monthIndex: number; year: number }

export const DASHBOARD_PRESETS: Array<{ value: DashboardDateFilterPreset; label: string }> = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-3-months', label: 'Last 3 months' },
  { value: 'year-to-date', label: 'Year to date' },
]

export const DEFAULT_DASHBOARD_FILTER: DashboardDateFilterValue = {
  mode: 'preset',
  preset: 'this-month',
}

export type DashboardDateWindow = {
  start: Date
  end: Date
  /** Comparison window: the same span shifted back (same days-to-date when the window is partial). */
  previousStart: Date
  previousEnd: Date
  /** Billing months (`YYYY-MM`) the window covers, for invoice-period matching. */
  monthKeys: string[]
  /** True when the window is cut short at today (month/period still in progress). */
  isPartial: boolean
}

/** Validates an untrusted filter (it arrives through a public server action). */
export function parseDashboardFilter(
  value: unknown,
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIME_ZONE,
): DashboardDateFilterValue {
  const v = value as Partial<Record<string, unknown>> | null
  if (v?.mode === 'preset' && DASHBOARD_PRESETS.some((p) => p.value === v.preset)) {
    return { mode: 'preset', preset: v.preset as DashboardDateFilterPreset }
  }
  if (
    v?.mode === 'month' &&
    Number.isInteger(v.monthIndex) &&
    Number.isInteger(v.year) &&
    (v.monthIndex as number) >= 0 &&
    (v.monthIndex as number) <= 11 &&
    (v.year as number) >= 2000 &&
    (v.year as number) <= 2100
  ) {
    const today = zonedParts(now, timeZone)
    if ((v.year as number) * 12 + (v.monthIndex as number) > today.year * 12 + today.month) {
      throw new Error('Invalid dashboard period')
    }
    return { mode: 'month', monthIndex: v.monthIndex as number, year: v.year as number }
  }
  throw new Error('Invalid dashboard period')
}

/**
 * A window of `monthCount` whole calendar months starting at (year, month), cut at the end of
 * today if it hasn't finished. The comparison window is shifted back by `shiftMonths`; when the
 * window is partial, it covers the same number of days-to-date (e.g. Sep 1–29 vs Aug 1–29).
 */
function calendarWindow(
  year: number,
  month: number,
  monthCount: number,
  shiftMonths: number,
  now: Date,
  timeZone: string,
): DashboardDateWindow {
  const today = zonedParts(now, timeZone)
  const start = zonedStartOfMonth(year, month, timeZone)
  const fullEnd = new Date(zonedStartOfMonth(year, month + monthCount, timeZone).getTime() - 1)
  const todayEnd = zonedEndOfDay(today.year, today.month, today.day, timeZone)
  const isPartial = todayEnd < fullEnd
  const end = isPartial ? todayEnd : fullEnd

  const previousStart = zonedStartOfMonth(year, month - shiftMonths, timeZone)
  let previousEnd: Date
  if (isPartial) {
    const shifted = new Date(Date.UTC(today.year, today.month - shiftMonths, 1))
    const shiftedYear = shifted.getUTCFullYear()
    const shiftedMonth = shifted.getUTCMonth()
    const day = Math.min(today.day, daysInMonth(shiftedYear, shiftedMonth))
    previousEnd = zonedEndOfDay(shiftedYear, shiftedMonth, day, timeZone)
  } else {
    previousEnd = new Date(
      zonedStartOfMonth(year, month - shiftMonths + monthCount, timeZone).getTime() - 1,
    )
  }

  const lastMonthIndex = isPartial ? today.year * 12 + today.month : year * 12 + month + monthCount - 1
  const monthKeys: string[] = []
  for (let index = year * 12 + month; index <= lastMonthIndex; index += 1) {
    monthKeys.push(monthKeyOf(Math.floor(index / 12), index % 12))
  }

  return { start, end, previousStart, previousEnd, monthKeys, isPartial }
}

export function resolveDashboardDateWindow(
  value: DashboardDateFilterValue,
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIME_ZONE,
): DashboardDateWindow {
  const today = zonedParts(now, timeZone)

  if (value.mode === 'month') {
    return calendarWindow(value.year, value.monthIndex, 1, 1, now, timeZone)
  }

  switch (value.preset) {
    case 'this-month':
      return calendarWindow(today.year, today.month, 1, 1, now, timeZone)
    case 'last-month':
      return calendarWindow(today.year, today.month - 1, 1, 1, now, timeZone)
    case 'last-3-months':
      return calendarWindow(today.year, today.month - 2, 3, 3, now, timeZone)
    case 'year-to-date':
      return calendarWindow(today.year, 0, today.month + 1, 12, now, timeZone)
  }
}

const rangeFormatters = new Map<string, Intl.DateTimeFormat>()

/** "Sep 1 – 29, 2026" style label for a window, in the business timezone. */
export function formatDateRange(
  start: Date,
  end: Date,
  timeZone: string = BUSINESS_TIME_ZONE,
): string {
  let formatter = rangeFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    rangeFormatters.set(timeZone, formatter)
  }
  return formatter.formatRange(start, end)
}

export function describeDashboardFilter(value: DashboardDateFilterValue): string {
  if (value.mode === 'month') {
    return new Date(Date.UTC(value.year, value.monthIndex, 1)).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }
  return DASHBOARD_PRESETS.find((p) => p.value === value.preset)?.label ?? ''
}

/** The last `count` months (newest first), including the current one, for the month picker. */
export function recentMonthOptions(
  count = 12,
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIME_ZONE,
): Array<{ year: number; monthIndex: number; label: string }> {
  const today = zonedParts(now, timeZone)
  return Array.from({ length: count }, (_, offset) => {
    const d = new Date(Date.UTC(today.year, today.month - offset, 1))
    return {
      year: d.getUTCFullYear(),
      monthIndex: d.getUTCMonth(),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    }
  })
}

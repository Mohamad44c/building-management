/**
 * Calendar math in the business timezone. Every dashboard day/month boundary is resolved here so
 * the result doesn't depend on where the server runs or where the viewer's browser is.
 */
export const BUSINESS_TIME_ZONE = 'Asia/Beirut'

export const DAY_MS = 86_400_000

export type ZonedParts = {
  year: number
  /** 0-based, like Date#getMonth */
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const partsFormatters = new Map<string, Intl.DateTimeFormat>()

const getPartsFormatter = (timeZone: string): Intl.DateTimeFormat => {
  let formatter = partsFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
    partsFormatters.set(timeZone, formatter)
  }
  return formatter
}

export function zonedParts(date: Date, timeZone: string = BUSINESS_TIME_ZONE): ZonedParts {
  const values: Record<string, number> = {}
  for (const part of getPartsFormatter(timeZone).formatToParts(date)) {
    if (part.type !== 'literal') values[part.type] = Number(part.value)
  }
  return {
    year: values.year,
    month: values.month - 1,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  }
}

/** Offset of `timeZone` from UTC at `date`, in ms (e.g. +3h → 10_800_000). */
const offsetMs = (date: Date, timeZone: string): number => {
  const p = zonedParts(date, timeZone)
  const asUtc = Date.UTC(p.year, p.month, p.day, p.hour, p.minute, p.second)
  return asUtc - Math.floor(date.getTime() / 1000) * 1000
}

/**
 * The instant at which the wall-clock time (year, month, day, 00:00) occurs in `timeZone`.
 * Month/day overflow normalizes like `Date.UTC` (month 12 → January next year, day 0 → last day
 * of the previous month).
 */
export function zonedStartOfDay(
  year: number,
  month: number,
  day: number,
  timeZone: string = BUSINESS_TIME_ZONE,
): Date {
  const guess = Date.UTC(year, month, day)
  const first = guess - offsetMs(new Date(guess), timeZone)
  const second = guess - offsetMs(new Date(first), timeZone)
  return new Date(second)
}

export const zonedStartOfMonth = (year: number, month: number, timeZone?: string): Date =>
  zonedStartOfDay(year, month, 1, timeZone)

/** Last millisecond of the given day. */
export const zonedEndOfDay = (year: number, month: number, day: number, timeZone?: string): Date =>
  new Date(zonedStartOfDay(year, month, day + 1, timeZone).getTime() - 1)

export const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

const pad = (n: number) => `${n}`.padStart(2, '0')

/** `YYYY-MM-DD` of the business-calendar day `date` falls on. */
export function dayKey(date: Date | string, timeZone: string = BUSINESS_TIME_ZONE): string {
  const p = zonedParts(new Date(date), timeZone)
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`
}

/** `YYYY-MM` of the business-calendar month `date` falls on. */
export function monthKey(date: Date | string, timeZone: string = BUSINESS_TIME_ZONE): string {
  const p = zonedParts(new Date(date), timeZone)
  return `${p.year}-${pad(p.month + 1)}`
}

export const monthKeyOf = (year: number, month: number): string => {
  const normalized = new Date(Date.UTC(year, month, 1))
  return `${normalized.getUTCFullYear()}-${pad(normalized.getUTCMonth() + 1)}`
}

/** Whole calendar days from `fromKey` to `toKey` (both `YYYY-MM-DD`); positive when `toKey` is later. */
export function dayKeyDiff(fromKey: string, toKey: string): number {
  const toUtc = (key: string) => {
    const [y, m, d] = key.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(toKey) - toUtc(fromKey)) / DAY_MS)
}

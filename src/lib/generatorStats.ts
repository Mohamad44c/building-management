import { BUSINESS_TIME_ZONE, dayKey } from '@/lib/businessTime'

export type DatedDoc = { date: string }
export type DieselStatDoc = DatedDoc & { totalAmount?: number | null; liters?: number | null }
export type MaintenanceStatDoc = DatedDoc & { amount?: number | null }
export type HoursStatDoc = DatedDoc & { hoursRun?: number | null }

export type GeneratorStatsSnapshot = {
  dieselSpent: number
  dieselLiters: number
  generatorHours: number
  maintenanceCost: number
  totalGeneratorExpenses: number
  /** Total generator cost divided by days the generator actually ran. */
  costPerActiveDay: number | null
  costPerHour: number | null
  activeDays: number
}

export type DailyHoursPoint = {
  date: string
  hoursRun: number
}

export type GeneratorDashboardStats = {
  current: GeneratorStatsSnapshot
  previous: GeneratorStatsSnapshot
  timeline: DailyHoursPoint[]
}

const toNumber = (value: unknown): number => Number(value) || 0

export const inWindow = <T extends DatedDoc>(docs: T[], start: Date, end: Date): T[] => {
  const from = start.getTime()
  const to = end.getTime()
  return docs.filter((doc) => {
    const t = new Date(doc.date).getTime()
    return t >= from && t <= to
  })
}

const hoursByDay = (hourDocs: HoursStatDoc[], timeZone: string): Map<string, number> => {
  const byDay = new Map<string, number>()
  for (const doc of hourDocs) {
    const key = dayKey(doc.date, timeZone)
    byDay.set(key, (byDay.get(key) ?? 0) + toNumber(doc.hoursRun))
  }
  return byDay
}

export function aggregateGeneratorStats(
  docs: { dieselDocs: DieselStatDoc[]; maintenanceDocs: MaintenanceStatDoc[]; hourDocs: HoursStatDoc[] },
  timeZone: string = BUSINESS_TIME_ZONE,
): GeneratorStatsSnapshot {
  // Invoiced diesel in the window (paid or not). Open payables are shown separately.
  const dieselSpent = docs.dieselDocs.reduce((sum, doc) => sum + toNumber(doc.totalAmount), 0)
  const dieselLiters = docs.dieselDocs.reduce((sum, doc) => sum + toNumber(doc.liters), 0)
  const maintenanceCost = docs.maintenanceDocs.reduce((sum, doc) => sum + toNumber(doc.amount), 0)
  const generatorHours = docs.hourDocs.reduce((sum, doc) => sum + toNumber(doc.hoursRun), 0)
  const totalGeneratorExpenses = dieselSpent + maintenanceCost
  const activeDays = [...hoursByDay(docs.hourDocs, timeZone).values()].filter((h) => h > 0).length

  return {
    dieselSpent,
    dieselLiters,
    generatorHours,
    maintenanceCost,
    totalGeneratorExpenses,
    costPerActiveDay: activeDays > 0 ? totalGeneratorExpenses / activeDays : null,
    costPerHour: generatorHours > 0 ? totalGeneratorExpenses / generatorHours : null,
    activeDays,
  }
}

/** Hours run per business-calendar day, for days that have a reading. */
export function buildHoursTimeline(
  hourDocs: HoursStatDoc[],
  timeZone: string = BUSINESS_TIME_ZONE,
): DailyHoursPoint[] {
  return [...hoursByDay(hourDocs, timeZone).entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, hoursRun]) => ({ date, hoursRun }))
}

/**
 * Current vs comparison-window generator stats. `docs` must cover both windows
 * (i.e. `[previousStart, end]`); they're sliced here so the caller reads each collection once.
 */
export function computeGeneratorDashboardStats(
  docs: { dieselDocs: DieselStatDoc[]; maintenanceDocs: MaintenanceStatDoc[]; hourDocs: HoursStatDoc[] },
  window: { start: Date; end: Date; previousStart: Date; previousEnd: Date },
  timeZone: string = BUSINESS_TIME_ZONE,
): GeneratorDashboardStats {
  const slice = (start: Date, end: Date) => ({
    dieselDocs: inWindow(docs.dieselDocs, start, end),
    maintenanceDocs: inWindow(docs.maintenanceDocs, start, end),
    hourDocs: inWindow(docs.hourDocs, start, end),
  })
  const current = slice(window.start, window.end)

  return {
    current: aggregateGeneratorStats(current, timeZone),
    previous: aggregateGeneratorStats(slice(window.previousStart, window.previousEnd), timeZone),
    timeline: buildHoursTimeline(current.hourDocs, timeZone),
  }
}

import type { Payload } from 'payload'

export type DashboardPeriodPreset = 'today' | 'week' | 'month' | 'year' | 'custom'

export type DashboardPeriod = {
  preset: DashboardPeriodPreset
  from?: string
  to?: string
}

type RangeWindow = {
  start: Date
  end: Date
  previousStart: Date
  previousEnd: Date
}

export type GeneratorStatsSnapshot = {
  dieselSpent: number
  dieselLiters: number
  dieselTons: number
  generatorHours: number
  maintenanceCost: number
  totalGeneratorExpenses: number
  costPerDay: number | null
  costPerHour: number | null
  activeDays: number
}

export type DailyHoursPoint = {
  date: string
  label: string
  hoursRun: number
}

export type GeneratorDashboardStats = {
  period: {
    preset: DashboardPeriodPreset
    start: string
    end: string
    previousStart: string
    previousEnd: string
  }
  current: GeneratorStatsSnapshot
  previous: GeneratorStatsSnapshot
  timeline: DailyHoursPoint[]
  estimatedMonthlyCollection: {
    amount: number | null
    monthsUsed: number
  }
}

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)

const endOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)

const buildRangeWindow = (period: DashboardPeriod): RangeWindow => {
  const now = new Date()
  let start = startOfDay(now)
  let end = endOfDay(now)

  if (period.preset === 'today') {
    start = startOfDay(now)
    end = endOfDay(now)
  }

  if (period.preset === 'week') {
    const dayIndex = now.getDay()
    const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex
    start = startOfDay(addDays(now, mondayOffset))
    end = endOfDay(now)
  }

  if (period.preset === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    end = endOfDay(now)
  }

  if (period.preset === 'year') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
    end = endOfDay(now)
  }

  if (period.preset === 'custom') {
    if (!period.from || !period.to) {
      throw new Error('Custom period requires both from and to values.')
    }
    start = startOfDay(new Date(period.from))
    end = endOfDay(new Date(period.to))
  }

  if (start > end) {
    throw new Error('Invalid period: start date is after end date.')
  }

  const rangeLengthMs = end.getTime() - start.getTime()
  const previousStart = new Date(start.getTime() - rangeLengthMs - 1)
  const previousEnd = new Date(end.getTime() - rangeLengthMs - 1)

  return {
    start,
    end,
    previousStart,
    previousEnd,
  }
}

const toNumber = (value: unknown): number => Number(value) || 0

const formatDayKey = (value: string | Date): string => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getLabelFromDayKey = (dayKey: string): string => {
  const [year, month, day] = dayKey.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const getActiveDays = (dayMap: Record<string, number>): number =>
  Object.values(dayMap).filter((hours) => hours > 0).length

const aggregateStats = ({
  dieselDocs,
  maintenanceDocs,
  hourDocs,
}: {
  dieselDocs: any[]
  maintenanceDocs: any[]
  hourDocs: any[]
}): GeneratorStatsSnapshot => {
  const dieselSpent = dieselDocs.reduce((sum, doc) => sum + toNumber(doc.totalAmount), 0)
  const dieselLiters = dieselDocs.reduce((sum, doc) => sum + toNumber(doc.liters), 0)
  const maintenanceCost = maintenanceDocs.reduce((sum, doc) => sum + toNumber(doc.amount), 0)
  const generatorHours = hourDocs.reduce((sum, doc) => sum + toNumber(doc.hoursRun), 0)
  const totalGeneratorExpenses = dieselSpent + maintenanceCost

  const activeDayMap = hourDocs.reduce<Record<string, number>>((acc, doc) => {
    const dayKey = formatDayKey(doc.date)
    acc[dayKey] = (acc[dayKey] || 0) + toNumber(doc.hoursRun)
    return acc
  }, {})

  const activeDays = getActiveDays(activeDayMap)

  return {
    dieselSpent,
    dieselLiters,
    dieselTons: dieselLiters / 1000,
    generatorHours,
    maintenanceCost,
    totalGeneratorExpenses,
    costPerDay: activeDays > 0 ? totalGeneratorExpenses / activeDays : null,
    costPerHour: generatorHours > 0 ? totalGeneratorExpenses / generatorHours : null,
    activeDays,
  }
}

const buildTimeline = (hourDocs: any[]): DailyHoursPoint[] => {
  const hoursByDay = hourDocs.reduce<Record<string, number>>((acc, doc) => {
    const dayKey = formatDayKey(doc.date)
    acc[dayKey] = (acc[dayKey] || 0) + toNumber(doc.hoursRun)
    return acc
  }, {})

  return Object.keys(hoursByDay)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((dayKey) => ({
      date: dayKey,
      label: getLabelFromDayKey(dayKey),
      hoursRun: hoursByDay[dayKey],
    }))
}

const monthKeyFromDate = (value: string | Date): string => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${year}-${month}`
}

const computeEstimatedMonthlyCollection = ({
  dieselDocs,
  maintenanceDocs,
  currentWindowStart,
}: {
  dieselDocs: any[]
  maintenanceDocs: any[]
  currentWindowStart: Date
}): { amount: number | null; monthsUsed: number } => {
  const currentMonthKey = monthKeyFromDate(currentWindowStart)
  const monthlyTotals = new Map<string, number>()

  for (const doc of dieselDocs) {
    const key = monthKeyFromDate(doc.date)
    monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + toNumber(doc.totalAmount))
  }

  for (const doc of maintenanceDocs) {
    const key = monthKeyFromDate(doc.date)
    monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + toNumber(doc.amount))
  }

  const previousMonthKeys = Array.from(monthlyTotals.keys())
    .filter((key) => key < currentMonthKey)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 3)

  if (previousMonthKeys.length === 0) {
    return {
      amount: null,
      monthsUsed: 0,
    }
  }

  const total = previousMonthKeys.reduce((sum, key) => sum + (monthlyTotals.get(key) ?? 0), 0)

  return {
    amount: total / previousMonthKeys.length,
    monthsUsed: previousMonthKeys.length,
  }
}

const readPeriodDocs = async (payload: Payload, start: Date, end: Date) => {
  const [diesel, maintenance, hours] = await Promise.all([
    payload.find({
      collection: 'diesel-expenses',
      where: {
        date: {
          greater_than_equal: start.toISOString(),
          less_than_equal: end.toISOString(),
        },
      },
      sort: 'date',
      limit: 0,
    }),
    payload.find({
      collection: 'generator-expenses',
      where: {
        date: {
          greater_than_equal: start.toISOString(),
          less_than_equal: end.toISOString(),
        },
      },
      sort: 'date',
      limit: 0,
    }),
    payload.find({
      collection: 'generator-hours',
      where: {
        date: {
          greater_than_equal: start.toISOString(),
          less_than_equal: end.toISOString(),
        },
      },
      sort: 'date',
      limit: 0,
    }),
  ])

  return {
    dieselDocs: diesel.docs,
    maintenanceDocs: maintenance.docs,
    hourDocs: hours.docs,
  }
}

export const getGeneratorDashboardStats = async (
  payload: Payload,
  period: DashboardPeriod,
): Promise<GeneratorDashboardStats> => {
  const window = buildRangeWindow(period)
  const currentDocs = await readPeriodDocs(payload, window.start, window.end)
  const previousDocs = await readPeriodDocs(payload, window.previousStart, window.previousEnd)
  const completedMonthsRangeStart = startOfMonth(new Date(window.start.getFullYear() - 2, 0, 1))
  const historicalDocs = await readPeriodDocs(payload, completedMonthsRangeStart, window.end)
  const estimatedMonthlyCollection = computeEstimatedMonthlyCollection({
    dieselDocs: historicalDocs.dieselDocs,
    maintenanceDocs: historicalDocs.maintenanceDocs,
    currentWindowStart: window.start,
  })

  return {
    period: {
      preset: period.preset,
      start: window.start.toISOString(),
      end: window.end.toISOString(),
      previousStart: window.previousStart.toISOString(),
      previousEnd: window.previousEnd.toISOString(),
    },
    current: aggregateStats(currentDocs),
    previous: aggregateStats(previousDocs),
    timeline: buildTimeline(currentDocs.hourDocs),
    estimatedMonthlyCollection,
  }
}

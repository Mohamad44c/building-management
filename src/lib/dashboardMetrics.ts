import {
  BUSINESS_TIME_ZONE,
  DAY_MS,
  dayKey,
  dayKeyDiff,
  monthKey,
  monthKeyOf,
  zonedParts,
} from '@/lib/businessTime'
import { effectiveAmountPaid, remainingBalance, roundCents } from '@/lib/dieselExpenseBalance'
import { linearRegression, movingAverage, projectLinear } from '@/lib/forecast'

type Id = string | number
type Relation = Id | { id: Id } | null | undefined

const relationId = (value: Relation): string | null => {
  if (value == null) return null
  return typeof value === 'object' ? String(value.id) : String(value)
}

const toNumber = (value: unknown): number => Number(value) || 0

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export type InvoiceMetricDoc = {
  totalAmount?: number | null
  amountPaid?: number | null
  isPaid?: boolean | null
  dueDate?: string | null
  periodMonth?: number | null
  periodYear?: number | null
}

const invoiceMonthKey = (doc: InvoiceMetricDoc): string | null =>
  doc.periodYear && doc.periodMonth ? monthKeyOf(doc.periodYear, doc.periodMonth - 1) : null

/** Whole business days past the due date (≤ 0 when not yet due, null when there is no due date). */
const daysPastDue = (doc: InvoiceMetricDoc, now: Date, timeZone: string): number | null =>
  doc.dueDate ? dayKeyDiff(dayKey(doc.dueDate, timeZone), dayKey(now, timeZone)) : null

export type RentCollectionSummary = {
  totalBilled: number
  totalCollected: number
  outstanding: number
  collectionRatePct: number | null
  overdueCount: number
  overdueAmount: number
  invoiceCount: number
}

/**
 * Rent billed/collected for invoices whose billing period (periodMonth/periodYear) is one of
 * `monthKeys` — not the date the invoice happened to be created or paid.
 */
export function summarizeRentCollection(
  docs: InvoiceMetricDoc[],
  monthKeys: string[],
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIME_ZONE,
): RentCollectionSummary {
  const months = new Set(monthKeys)
  let totalBilled = 0
  let totalCollected = 0
  let overdueCount = 0
  let overdueAmount = 0
  let invoiceCount = 0

  for (const doc of docs) {
    const key = invoiceMonthKey(doc)
    if (!key || !months.has(key)) continue

    invoiceCount += 1
    totalBilled = roundCents(totalBilled + toNumber(doc.totalAmount))
    totalCollected = roundCents(totalCollected + effectiveAmountPaid(doc))

    const owed = remainingBalance(doc)
    const late = daysPastDue(doc, now, timeZone)
    if (owed > 0 && late !== null && late > 0) {
      overdueCount += 1
      overdueAmount = roundCents(overdueAmount + owed)
    }
  }

  return {
    totalBilled,
    totalCollected,
    outstanding: Math.max(0, roundCents(totalBilled - totalCollected)),
    collectionRatePct: totalBilled > 0 ? (totalCollected / totalBilled) * 100 : null,
    overdueCount,
    overdueAmount,
    invoiceCount,
  }
}

export type ReceivablesAgingBucketKey = 'current' | '1-30' | '31-60' | '61-90' | '90+'

export type ReceivablesAgingBucket = {
  bucket: ReceivablesAgingBucketKey
  label: string
  totalOwed: number
  invoiceCount: number
}

export type ReceivablesAging = {
  buckets: ReceivablesAgingBucket[]
  totalOwed: number
  overdueOwed: number
}

const AGING_BUCKETS: Array<{ bucket: ReceivablesAgingBucketKey; label: string }> = [
  { bucket: 'current', label: 'Not yet due' },
  { bucket: '1-30', label: '1–30 days' },
  { bucket: '31-60', label: '31–60 days' },
  { bucket: '61-90', label: '61–90 days' },
  { bucket: '90+', label: '90+ days' },
]

/**
 * Outstanding invoice balances bucketed by days past due. Invoices that aren't due yet — or have
 * no due date — are "Not yet due" rather than being mixed into the first overdue bucket.
 */
export function computeReceivablesAging(
  docs: InvoiceMetricDoc[],
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIME_ZONE,
): ReceivablesAging {
  const buckets: ReceivablesAgingBucket[] = AGING_BUCKETS.map((b) => ({
    ...b,
    totalOwed: 0,
    invoiceCount: 0,
  }))

  for (const doc of docs) {
    const owed = remainingBalance(doc)
    if (owed <= 0) continue

    const late = daysPastDue(doc, now, timeZone)
    const index =
      late === null || late <= 0 ? 0 : late <= 30 ? 1 : late <= 60 ? 2 : late <= 90 ? 3 : 4
    buckets[index].totalOwed = roundCents(buckets[index].totalOwed + owed)
    buckets[index].invoiceCount += 1
  }

  const totalOwed = roundCents(buckets.reduce((sum, b) => sum + b.totalOwed, 0))
  return { buckets, totalOwed, overdueOwed: roundCents(totalOwed - buckets[0].totalOwed) }
}

export type RentCollectionForecast = {
  history: Array<{ month: string; billed: number; collected: number }>
  /** Month being projected (the current business month). */
  targetMonth: string
  projectedCollection: number | null
  /** Median share of billed eventually collected, from months ≥ 2 months old (null if none yet). */
  collectionRate: number | null
  monthsUsed: number
}

/**
 * Projects the current month's rent collection from up to 6 completed billing months:
 * the billed trend (linear, moving average as fallback) times the median collection rate of
 * "mature" months (≥ 2 months old). Recent months are still being paid, so trending the
 * collected amounts directly would understate every forecast.
 */
export function forecastRentCollection(
  docs: InvoiceMetricDoc[],
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIME_ZONE,
): RentCollectionForecast {
  const currentMonth = monthKey(now, timeZone)
  const totals = new Map<string, { billed: number; collected: number }>()

  for (const doc of docs) {
    const key = invoiceMonthKey(doc)
    if (!key || key >= currentMonth) continue
    const entry = totals.get(key) ?? { billed: 0, collected: 0 }
    entry.billed = roundCents(entry.billed + toNumber(doc.totalAmount))
    entry.collected = roundCents(entry.collected + effectiveAmountPaid(doc))
    totals.set(key, entry)
  }

  const history = [...totals.keys()]
    .sort()
    .slice(-6)
    .map((month) => ({ month, ...totals.get(month)! }))

  if (history.length === 0) {
    return { history, targetMonth: currentMonth, projectedCollection: null, collectionRate: null, monthsUsed: 0 }
  }

  const trend = (values: number[]) =>
    projectLinear(
      values.map((y, x) => ({ x, y })),
      values.length,
    ) ?? movingAverage(values, 3)

  const today = zonedParts(now, timeZone)
  const matureCutoff = monthKeyOf(today.year, today.month - 2)
  const rates = history
    .filter((h) => h.month <= matureCutoff && h.billed > 0)
    .map((h) => Math.min(1, h.collected / h.billed))
    .sort((a, b) => a - b)
  const collectionRate =
    rates.length === 0
      ? null
      : rates.length % 2
        ? rates[(rates.length - 1) / 2]
        : (rates[rates.length / 2 - 1] + rates[rates.length / 2]) / 2

  const billedTrend = trend(history.map((h) => h.billed))
  // Without a mature month there is no rate yet; fall back to trending collected amounts.
  const projected =
    collectionRate !== null && billedTrend !== null
      ? Math.max(0, billedTrend) * collectionRate
      : trend(history.map((h) => h.collected))

  return {
    history,
    targetMonth: currentMonth,
    projectedCollection: projected !== null ? Math.max(0, roundCents(projected)) : null,
    collectionRate,
    monthsUsed: history.length,
  }
}

// ---------------------------------------------------------------------------
// Diesel
// ---------------------------------------------------------------------------

export type DieselPriceDoc = {
  date: string
  pricePerLiter?: number | null
  pricePerThousandLiters?: number | null
}

export const pricePerLiterUsd = (doc: DieselPriceDoc): number => {
  const fromField = Number(doc.pricePerLiter)
  if (Number.isFinite(fromField) && fromField > 0) {
    return Math.round(fromField * 10000) / 10000
  }
  const perThousand = Number(doc.pricePerThousandLiters)
  if (Number.isFinite(perThousand) && perThousand > 0) {
    return Math.round((perThousand / 1000) * 10000) / 10000
  }
  return 0
}

/** One point per delivery with a known price, oldest first. */
export function dieselPriceSeries(docs: DieselPriceDoc[]): Array<{ date: string; pricePerLiter: number }> {
  return docs
    .map((doc) => ({ date: doc.date, pricePerLiter: pricePerLiterUsd(doc) }))
    .filter((row) => row.pricePerLiter > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export type DieselPriceForecast = {
  lastPrice: number | null
  lastDeliveryDate: string | null
  projectedNextPrice: number | null
  trend: 'up' | 'down' | 'flat' | null
  pointsUsed: number
}

export const DIESEL_FORECAST_DELIVERIES = 8

/**
 * Linear trend of price vs. delivery date over the most recent deliveries, projected to the next
 * expected delivery (last delivery + median gap). Trend-based only, not a market forecast.
 */
export function forecastDieselPrice(docs: DieselPriceDoc[]): DieselPriceForecast {
  const series = dieselPriceSeries(docs).slice(-DIESEL_FORECAST_DELIVERIES)
  const last = series[series.length - 1]
  const base: DieselPriceForecast = {
    lastPrice: last?.pricePerLiter ?? null,
    lastDeliveryDate: last?.date ?? null,
    projectedNextPrice: null,
    trend: null,
    pointsUsed: series.length,
  }
  if (series.length < 3) return base

  const points = series.map((row) => ({
    x: new Date(row.date).getTime() / DAY_MS,
    y: row.pricePerLiter,
  }))
  const regression = linearRegression(points)
  if (!regression) return base

  const gaps = points
    .slice(1)
    .map((p, i) => p.x - points[i].x)
    .sort((a, b) => a - b)
  const medianGap = gaps[Math.floor(gaps.length / 2)]
  const nextX = points[points.length - 1].x + Math.max(1, medianGap)
  const projected = Math.max(0, regression.slope * nextX + regression.intercept)
  const change = (projected - last.pricePerLiter) / last.pricePerLiter

  return {
    ...base,
    projectedNextPrice: Math.round(projected * 10000) / 10000,
    trend: Math.abs(change) < 0.005 ? 'flat' : change > 0 ? 'up' : 'down',
  }
}

export type DieselOutstandingSummary = {
  totalOwed: number
  unpaidInvoiceCount: number
}

export function summarizeDieselOutstanding(
  docs: Array<{ totalAmount?: number | null; amountPaid?: number | null; isPaid?: boolean | null }>,
): DieselOutstandingSummary {
  let totalOwed = 0
  let unpaidInvoiceCount = 0
  for (const doc of docs) {
    const owed = remainingBalance(doc)
    if (owed > 0) {
      totalOwed = roundCents(totalOwed + owed)
      unpaidInvoiceCount += 1
    }
  }
  return { totalOwed, unpaidInvoiceCount }
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export const SERVICE_INTERVAL_HOURS = 250

export type GeneratorMaintenanceForecast =
  | { status: 'unavailable'; reason: string }
  | {
      status: 'ok'
      currentMeter: number
      lastServiceMeter: number
      lastServiceDate: string
      hoursSinceService: number
      /** Negative when the service is overdue. */
      hoursRemaining: number
      avgHoursPerDay: number | null
      estimatedDueDate: string | null
    }

/**
 * Next oil change estimate. The oil-change expense's `hours` is the generator meter reading at the
 * time of service; `SERVICE_INTERVAL_HOURS` is an assumed interval (no field stores it yet).
 * The run rate comes from the meter delta across readings in the last 30 days.
 */
export function forecastGeneratorMaintenance(input: {
  latestReading: { meterReading?: number | null; date: string } | undefined
  lastOilChange: { hours?: number | null; date: string } | undefined
  recentReadings: Array<{ meterReading?: number | null; date: string }>
  now?: Date
}): GeneratorMaintenanceForecast {
  const now = input.now ?? new Date()
  const currentMeter = Number(input.latestReading?.meterReading)
  if (!input.latestReading || !Number.isFinite(currentMeter)) {
    return { status: 'unavailable', reason: 'No generator meter readings recorded yet.' }
  }
  const lastServiceMeter = Number(input.lastOilChange?.hours)
  if (!input.lastOilChange || input.lastOilChange.hours == null || !Number.isFinite(lastServiceMeter)) {
    return {
      status: 'unavailable',
      reason: 'No oil change with a meter reading (hours) recorded yet.',
    }
  }
  if (lastServiceMeter > currentMeter) {
    return {
      status: 'unavailable',
      reason: `Last oil change meter (${lastServiceMeter} h) is above the latest reading (${currentMeter} h) — check the records.`,
    }
  }

  const hoursSinceService = currentMeter - lastServiceMeter
  const hoursRemaining = SERVICE_INTERVAL_HOURS - hoursSinceService

  const readings = input.recentReadings
    .filter((r) => Number.isFinite(Number(r.meterReading)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let avgHoursPerDay: number | null = null
  if (readings.length >= 2) {
    const first = readings[0]
    const last = readings[readings.length - 1]
    const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / DAY_MS
    const delta = Number(last.meterReading) - Number(first.meterReading)
    if (days >= 1 && delta >= 0) avgHoursPerDay = delta / days
  }

  let estimatedDueDate: string | null = null
  if (hoursRemaining > 0 && avgHoursPerDay && avgHoursPerDay > 0) {
    estimatedDueDate = new Date(now.getTime() + (hoursRemaining / avgHoursPerDay) * DAY_MS).toISOString()
  }

  return {
    status: 'ok',
    currentMeter,
    lastServiceMeter,
    lastServiceDate: input.lastOilChange.date,
    hoursSinceService,
    hoursRemaining,
    avgHoursPerDay,
    estimatedDueDate,
  }
}

export type MonthlyGeneratorCost = {
  amount: number | null
  months: string[]
}

/**
 * Average monthly generator cost (diesel invoiced + maintenance) over the 3 completed business
 * months before `now`. Months with no records count as zero, except months before the first
 * record in `docs` (so a short history isn't diluted by months that predate data entry).
 */
export function averageMonthlyGeneratorCost(
  dieselDocs: Array<{ date: string; totalAmount?: number | null }>,
  maintenanceDocs: Array<{ date: string; amount?: number | null }>,
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIME_ZONE,
): MonthlyGeneratorCost {
  const today = zonedParts(now, timeZone)
  const totals = new Map<string, number>()
  let earliest: string | null = null
  const add = (date: string, amount: number) => {
    const key = monthKey(date, timeZone)
    totals.set(key, (totals.get(key) ?? 0) + amount)
    if (earliest === null || key < earliest) earliest = key
  }
  dieselDocs.forEach((doc) => add(doc.date, toNumber(doc.totalAmount)))
  maintenanceDocs.forEach((doc) => add(doc.date, toNumber(doc.amount)))

  const months = [3, 2, 1]
    .map((back) => monthKeyOf(today.year, today.month - back))
    .filter((key) => earliest !== null && key >= earliest)
  if (months.length === 0) return { amount: null, months }

  const total = months.reduce((sum, key) => sum + (totals.get(key) ?? 0), 0)
  return { amount: roundCents(total / months.length), months }
}

// ---------------------------------------------------------------------------
// Buildings, tenants, payments, expenses
// ---------------------------------------------------------------------------

export type BuildingDoc = { id: Id; name?: string | null }
export type TenantMetricDoc = {
  id: Id
  building?: Relation
  active?: boolean | null
  ampsTaken?: number | null
  monthlyFee?: number | null
  buildingFee?: number | null
}

export type TenantsByBuilding = {
  buildings: Array<{
    id: string
    name: string
    tenantCount: number
    inactiveCount: number
    totalAmps: number
    totalMonthlyFees: number
    totalBuildingFees: number
  }>
  totals: {
    tenantCount: number
    inactiveCount: number
    totalAmps: number
    totalMonthlyFees: number
    totalBuildingFees: number
  }
}

/** Per-building totals over active tenants (`active !== false`); inactive ones are only counted. */
export function summarizeTenantsByBuilding(
  buildings: BuildingDoc[],
  tenants: TenantMetricDoc[],
): TenantsByBuilding {
  const rows = buildings.map((b) => ({
    id: String(b.id),
    name: b.name ?? 'Unnamed building',
    tenantCount: 0,
    inactiveCount: 0,
    totalAmps: 0,
    totalMonthlyFees: 0,
    totalBuildingFees: 0,
  }))
  const byId = new Map(rows.map((row) => [row.id, row]))

  for (const tenant of tenants) {
    const row = byId.get(relationId(tenant.building) ?? '')
    if (!row) continue
    if (tenant.active === false) {
      row.inactiveCount += 1
      continue
    }
    row.tenantCount += 1
    row.totalAmps += toNumber(tenant.ampsTaken)
    row.totalMonthlyFees = roundCents(row.totalMonthlyFees + toNumber(tenant.monthlyFee))
    row.totalBuildingFees = roundCents(row.totalBuildingFees + toNumber(tenant.buildingFee))
  }

  const totals = rows.reduce(
    (acc, row) => ({
      tenantCount: acc.tenantCount + row.tenantCount,
      inactiveCount: acc.inactiveCount + row.inactiveCount,
      totalAmps: acc.totalAmps + row.totalAmps,
      totalMonthlyFees: roundCents(acc.totalMonthlyFees + row.totalMonthlyFees),
      totalBuildingFees: roundCents(acc.totalBuildingFees + row.totalBuildingFees),
    }),
    { tenantCount: 0, inactiveCount: 0, totalAmps: 0, totalMonthlyFees: 0, totalBuildingFees: 0 },
  )

  return { buildings: rows, totals }
}

export type PaymentsByBuilding = {
  buildings: Array<{ id: string; name: string; total: number; count: number }>
  grandTotal: number
  paymentCount: number
}

/**
 * Recorded payments per building (via the paying tenant). Payments whose tenant or building can't
 * be resolved are grouped as "Unassigned" instead of silently dropping out of the total.
 */
export function summarizePaymentsByBuilding(
  buildings: BuildingDoc[],
  tenants: Array<{ id: Id; building?: Relation }>,
  payments: Array<{ tenant?: Relation; amount?: number | null }>,
): PaymentsByBuilding {
  const tenantBuilding = new Map(tenants.map((t) => [String(t.id), relationId(t.building)]))
  const rows = buildings.map((b) => ({
    id: String(b.id),
    name: b.name ?? 'Unnamed building',
    total: 0,
    count: 0,
  }))
  const byId = new Map(rows.map((row) => [row.id, row]))
  const unassigned = { id: 'unassigned', name: 'Unassigned', total: 0, count: 0 }

  for (const payment of payments) {
    const buildingId = tenantBuilding.get(relationId(payment.tenant) ?? '') ?? null
    const row = (buildingId && byId.get(buildingId)) || unassigned
    row.total = roundCents(row.total + toNumber(payment.amount))
    row.count += 1
  }

  const all = unassigned.count > 0 ? [...rows, unassigned] : rows
  return {
    buildings: all,
    grandTotal: roundCents(all.reduce((sum, row) => sum + row.total, 0)),
    paymentCount: payments.length,
  }
}

export type ExpensesByCategory = {
  categories: Array<{ id: string; name: string; totalAmount: number; count: number }>
  grandTotal: number
}

export function summarizeExpensesByCategory(
  categories: Array<{ id: Id; name?: string | null }>,
  expenses: Array<{ category?: Relation; amount?: number | null }>,
): ExpensesByCategory {
  const names = new Map(categories.map((c) => [String(c.id), c.name ?? 'Unnamed category']))
  const groups = new Map<string, { id: string; name: string; totalAmount: number; count: number }>()

  for (const expense of expenses) {
    const categoryId = relationId(expense.category)
    const id = categoryId && names.has(categoryId) ? categoryId : 'uncategorized'
    const group = groups.get(id) ?? {
      id,
      name: id === 'uncategorized' ? 'Uncategorized' : names.get(id)!,
      totalAmount: 0,
      count: 0,
    }
    group.totalAmount = roundCents(group.totalAmount + toNumber(expense.amount))
    group.count += 1
    groups.set(id, group)
  }

  const sorted = [...groups.values()].sort((a, b) => b.totalAmount - a.totalAmount)
  return {
    categories: sorted,
    grandTotal: roundCents(sorted.reduce((sum, c) => sum + c.totalAmount, 0)),
  }
}

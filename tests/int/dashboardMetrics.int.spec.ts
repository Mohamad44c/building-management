import { describe, expect, it } from 'vitest'
import { dayKey, dayKeyDiff, monthKey, zonedStartOfDay, zonedEndOfDay } from '@/lib/businessTime'
import {
  parseDashboardFilter,
  recentMonthOptions,
  resolveDashboardDateWindow,
} from '@/lib/dashboardDateFilter'
import { computeGeneratorDashboardStats } from '@/lib/generatorStats'
import {
  averageMonthlyGeneratorCost,
  computeReceivablesAging,
  forecastDieselPrice,
  forecastGeneratorMaintenance,
  forecastRentCollection,
  summarizeExpensesByCategory,
  summarizePaymentsByBuilding,
  summarizeRentCollection,
  summarizeTenantsByBuilding,
} from '@/lib/dashboardMetrics'

const iso = (d: Date) => d.toISOString()

describe('businessTime (Asia/Beirut)', () => {
  it('resolves midnight in summer (UTC+3) and winter (UTC+2)', () => {
    expect(iso(zonedStartOfDay(2026, 8, 1))).toBe('2026-08-31T21:00:00.000Z')
    expect(iso(zonedStartOfDay(2026, 0, 1))).toBe('2025-12-31T22:00:00.000Z')
  })

  it('handles DST transition days', () => {
    // DST starts Sun Mar 29 2026, ends Sun Oct 25 2026 in Beirut.
    expect(iso(zonedStartOfDay(2026, 2, 29))).toBe('2026-03-28T22:00:00.000Z')
    expect(iso(zonedStartOfDay(2026, 2, 30))).toBe('2026-03-29T21:00:00.000Z')
    // Clocks fall back from 00:00 to 23:00 on Oct 25, so that day's midnight is at +2.
    expect(iso(zonedStartOfDay(2026, 9, 25))).toBe('2026-10-24T22:00:00.000Z')
    expect(iso(zonedStartOfDay(2026, 9, 26))).toBe('2026-10-25T22:00:00.000Z')
    expect(iso(zonedEndOfDay(2026, 9, 25))).toBe('2026-10-25T21:59:59.999Z')
  })

  it('keys instants by the Beirut calendar, not UTC', () => {
    expect(dayKey('2026-09-28T22:30:00.000Z')).toBe('2026-09-29')
    expect(monthKey('2026-08-31T21:30:00.000Z')).toBe('2026-09')
    expect(dayKeyDiff('2026-12-30', '2027-01-02')).toBe(3)
  })
})

describe('resolveDashboardDateWindow', () => {
  const now = new Date('2026-09-29T09:00:00.000Z')

  it('this month: month-to-date vs the same days last month', () => {
    const w = resolveDashboardDateWindow({ mode: 'preset', preset: 'this-month' }, now)
    expect(iso(w.start)).toBe('2026-08-31T21:00:00.000Z')
    expect(iso(w.end)).toBe('2026-09-29T20:59:59.999Z')
    expect(iso(w.previousStart)).toBe('2026-07-31T21:00:00.000Z')
    expect(iso(w.previousEnd)).toBe('2026-08-29T20:59:59.999Z')
    expect(w.isPartial).toBe(true)
    expect(w.monthKeys).toEqual(['2026-09'])
  })

  it('clamps the comparison day to the shorter previous month', () => {
    const w = resolveDashboardDateWindow(
      { mode: 'preset', preset: 'this-month' },
      new Date('2026-03-31T10:00:00.000Z'),
    )
    // Mar 1–31 (partial, today is the 31st) vs Feb 1–28
    expect(iso(w.previousEnd)).toBe('2026-02-28T21:59:59.999Z')
  })

  it('last month: full month vs the full month before', () => {
    const w = resolveDashboardDateWindow({ mode: 'preset', preset: 'last-month' }, now)
    expect(iso(w.start)).toBe('2026-07-31T21:00:00.000Z')
    expect(iso(w.end)).toBe('2026-08-31T20:59:59.999Z')
    expect(iso(w.previousStart)).toBe('2026-06-30T21:00:00.000Z')
    expect(iso(w.previousEnd)).toBe('2026-07-31T20:59:59.999Z')
    expect(w.isPartial).toBe(false)
  })

  it('crosses the year boundary', () => {
    const jan = new Date('2027-01-10T10:00:00.000Z')
    const last = resolveDashboardDateWindow({ mode: 'preset', preset: 'last-month' }, jan)
    expect(last.monthKeys).toEqual(['2026-12'])
    const three = resolveDashboardDateWindow({ mode: 'preset', preset: 'last-3-months' }, jan)
    expect(three.monthKeys).toEqual(['2026-11', '2026-12', '2027-01'])
    expect(iso(three.previousStart)).toBe('2026-07-31T21:00:00.000Z') // Aug 1
    expect(iso(three.previousEnd)).toBe('2026-10-10T20:59:59.999Z') // Oct 10
  })

  it('year to date compares with the same span last year', () => {
    const w = resolveDashboardDateWindow({ mode: 'preset', preset: 'year-to-date' }, now)
    expect(iso(w.start)).toBe('2025-12-31T22:00:00.000Z')
    expect(iso(w.previousStart)).toBe('2024-12-31T22:00:00.000Z')
    expect(iso(w.previousEnd)).toBe('2025-09-29T20:59:59.999Z')
    expect(w.monthKeys).toHaveLength(9)
  })

  it('picking the current month behaves like this month', () => {
    const w = resolveDashboardDateWindow({ mode: 'month', year: 2026, monthIndex: 8 }, now)
    expect(w.isPartial).toBe(true)
    expect(iso(w.end)).toBe('2026-09-29T20:59:59.999Z')
  })

  it('month options span the year boundary', () => {
    const options = recentMonthOptions(3, new Date('2027-01-05T10:00:00.000Z'))
    expect(options.map((o) => [o.year, o.monthIndex])).toEqual([
      [2027, 0],
      [2026, 11],
      [2026, 10],
    ])
  })

  it('rejects malformed filters', () => {
    expect(() => parseDashboardFilter({ mode: 'preset', preset: 'forever' })).toThrow()
    expect(() => parseDashboardFilter({ mode: 'month', year: 2026, monthIndex: 12 })).toThrow()
    expect(() => parseDashboardFilter({ mode: 'month', year: 2030, monthIndex: 0 }, now)).toThrow()
    expect(() => parseDashboardFilter({ mode: 'month', year: 2026, monthIndex: 9 }, now)).toThrow()
    expect(parseDashboardFilter({ mode: 'month', year: 2026, monthIndex: 8 }, now).mode).toBe('month')
    expect(parseDashboardFilter({ mode: 'month', year: 2026, monthIndex: 0 })).toEqual({
      mode: 'month',
      year: 2026,
      monthIndex: 0,
    })
  })
})

describe('generator stats', () => {
  it('slices current and previous windows and groups hours by Beirut day', () => {
    const window = resolveDashboardDateWindow(
      { mode: 'preset', preset: 'this-month' },
      new Date('2026-09-29T09:00:00.000Z'),
    )
    const stats = computeGeneratorDashboardStats(
      {
        dieselDocs: [
          { date: '2026-09-05T08:00:00.000Z', totalAmount: 1000, liters: 1000 },
          { date: '2026-08-05T08:00:00.000Z', totalAmount: 800, liters: 900 },
          { date: '2026-08-30T08:00:00.000Z', totalAmount: 999, liters: 999 }, // after Aug 29 cutoff
        ],
        maintenanceDocs: [{ date: '2026-09-10T08:00:00.000Z', amount: 100 }],
        hourDocs: [
          // 22:30Z on Sep 1 is Sep 2 in Beirut; same day as the next reading
          { date: '2026-09-01T22:30:00.000Z', hoursRun: 4 },
          { date: '2026-09-02T10:00:00.000Z', hoursRun: 6 },
          { date: '2026-09-03T10:00:00.000Z', hoursRun: 0 },
        ],
      },
      window,
    )
    expect(stats.current.dieselSpent).toBe(1000)
    expect(stats.previous.dieselSpent).toBe(800)
    expect(stats.current.totalGeneratorExpenses).toBe(1100)
    expect(stats.current.activeDays).toBe(1)
    expect(stats.current.costPerActiveDay).toBe(1100)
    expect(stats.current.costPerHour).toBe(110)
    expect(stats.timeline).toEqual([
      { date: '2026-09-02', hoursRun: 10 },
      { date: '2026-09-03', hoursRun: 0 },
    ])
  })
})

describe('invoices', () => {
  const now = new Date('2026-09-29T09:00:00.000Z')

  it('matches invoices by billing period and counts overdue by balance', () => {
    const summary = summarizeRentCollection(
      [
        { periodYear: 2026, periodMonth: 9, totalAmount: 100, amountPaid: 40, isPaid: false, dueDate: '2026-09-10T09:00:00.000Z' },
        { periodYear: 2026, periodMonth: 9, totalAmount: 50, amountPaid: 0, isPaid: true, dueDate: '2026-09-10T09:00:00.000Z' },
        { periodYear: 2026, periodMonth: 9, totalAmount: 70, amountPaid: 0, isPaid: false, dueDate: '2026-10-05T09:00:00.000Z' },
        { periodYear: 2026, periodMonth: 8, totalAmount: 999, amountPaid: 0, isPaid: false },
      ],
      ['2026-09'],
      now,
    )
    expect(summary).toMatchObject({
      invoiceCount: 3,
      totalBilled: 220,
      totalCollected: 90,
      outstanding: 130,
      overdueCount: 1,
      overdueAmount: 60,
    })
  })

  it('ages balances, keeping not-yet-due and undated invoices out of the overdue buckets', () => {
    const aging = computeReceivablesAging(
      [
        { totalAmount: 100, amountPaid: 0, isPaid: false, dueDate: '2026-10-05T09:00:00.000Z' },
        { totalAmount: 10, amountPaid: 0, isPaid: false, dueDate: null },
        { totalAmount: 20, amountPaid: 0, isPaid: false, dueDate: '2026-09-28T09:00:00.000Z' },
        { totalAmount: 30, amountPaid: 0, isPaid: false, dueDate: '2026-07-15T09:00:00.000Z' },
        { totalAmount: 40, amountPaid: 0, isPaid: false, dueDate: '2026-01-01T09:00:00.000Z' },
        { totalAmount: 50, amountPaid: 50, isPaid: false, dueDate: '2026-01-01T09:00:00.000Z' },
      ],
      now,
    )
    expect(aging.buckets.map((b) => b.totalOwed)).toEqual([110, 20, 0, 30, 40])
    expect(aging.totalOwed).toBe(200)
    expect(aging.overdueOwed).toBe(90)
  })

  it('projects the current month from completed months only', () => {
    const docs = [6, 7, 8, 9].map((m) => ({
      periodYear: 2026,
      periodMonth: m,
      totalAmount: 1000,
      amountPaid: 500 + m * 50,
      isPaid: false,
    }))
    const forecast = forecastRentCollection(docs, now)
    expect(forecast.targetMonth).toBe('2026-09')
    expect(forecast.history.map((h) => h.month)).toEqual(['2026-06', '2026-07', '2026-08'])
    // Billed trend 1000 × median mature rate (Jun 0.80, Jul 0.85 → 0.825); Aug is still being collected.
    expect(forecast.collectionRate).toBeCloseTo(0.825, 6)
    expect(forecast.projectedCollection).toBe(825)
  })

  it('falls back to the collected trend before any month is mature', () => {
    const docs = [8].map((m) => ({ periodYear: 2026, periodMonth: m, totalAmount: 1000, amountPaid: 600, isPaid: false }))
    const forecast = forecastRentCollection(docs, now)
    expect(forecast.collectionRate).toBeNull()
    expect(forecast.projectedCollection).toBe(600)
  })
})

describe('diesel price forecast', () => {
  it('needs 3 deliveries and projects along the time trend', () => {
    expect(forecastDieselPrice([{ date: '2026-01-01', pricePerLiter: 1 }]).projectedNextPrice).toBeNull()
    const forecast = forecastDieselPrice([
      { date: '2026-01-01T00:00:00.000Z', pricePerLiter: 1.0 },
      { date: '2026-01-11T00:00:00.000Z', pricePerThousandLiters: 1100 },
      { date: '2026-01-21T00:00:00.000Z', pricePerLiter: 1.2 },
      { date: '2026-01-25T00:00:00.000Z', pricePerLiter: 0 }, // no price → ignored
    ])
    expect(forecast.pointsUsed).toBe(3)
    expect(forecast.lastPrice).toBe(1.2)
    expect(forecast.projectedNextPrice).toBeCloseTo(1.3, 4)
    expect(forecast.trend).toBe('up')
  })
})

describe('generator maintenance forecast', () => {
  const now = new Date('2026-09-29T00:00:00.000Z')

  it('uses the meter delta for the run rate', () => {
    const result = forecastGeneratorMaintenance({
      latestReading: { meterReading: 27100, date: '2026-09-28T00:00:00.000Z' },
      lastOilChange: { hours: 27000, date: '2026-09-01T00:00:00.000Z' },
      recentReadings: [
        { meterReading: 27000, date: '2026-09-08T00:00:00.000Z' },
        { meterReading: 27050, date: '2026-09-18T00:00:00.000Z' },
        { meterReading: 27100, date: '2026-09-28T00:00:00.000Z' },
      ],
      now,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.hoursRemaining).toBe(150)
    expect(result.avgHoursPerDay).toBe(5)
    expect(result.estimatedDueDate).toBe('2026-10-29T00:00:00.000Z')
  })

  it('reports overdue as negative remaining hours and guards bad records', () => {
    const overdue = forecastGeneratorMaintenance({
      latestReading: { meterReading: 27300, date: '2026-09-28' },
      lastOilChange: { hours: 27000, date: '2026-06-01' },
      recentReadings: [],
      now,
    })
    expect(overdue.status === 'ok' && overdue.hoursRemaining).toBe(-50)

    const inconsistent = forecastGeneratorMaintenance({
      latestReading: { meterReading: 100, date: '2026-09-28' },
      lastOilChange: { hours: 27000, date: '2026-06-01' },
      recentReadings: [],
      now,
    })
    expect(inconsistent.status).toBe('unavailable')
  })
})

describe('average monthly generator cost', () => {
  it('averages the 3 completed months, counting empty months after data starts', () => {
    const result = averageMonthlyGeneratorCost(
      [
        { date: '2026-07-10T10:00:00.000Z', totalAmount: 900 },
        { date: '2026-09-02T10:00:00.000Z', totalAmount: 5000 }, // current month, excluded
      ],
      [{ date: '2026-08-10T10:00:00.000Z', amount: 0 }],
      new Date('2026-09-29T09:00:00.000Z'),
    )
    // Data starts in July → Jun excluded; Jul 900, Aug 0.
    expect(result.months).toEqual(['2026-07', '2026-08'])
    expect(result.amount).toBe(450)
  })
})

describe('buildings, payments, expenses', () => {
  const buildings = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
  ]

  it('totals active tenants and counts inactive ones separately', () => {
    const result = summarizeTenantsByBuilding(buildings, [
      { id: 1, building: 1, active: true, ampsTaken: 10, monthlyFee: 50, buildingFee: 5 },
      { id: 2, building: 1, active: null, ampsTaken: 5, monthlyFee: 25 },
      { id: 3, building: 1, active: false, ampsTaken: 99, monthlyFee: 999 },
      { id: 4, building: { id: 2 }, active: true, ampsTaken: 1, monthlyFee: 10 },
    ])
    expect(result.buildings[0]).toMatchObject({
      tenantCount: 2,
      inactiveCount: 1,
      totalAmps: 15,
      totalMonthlyFees: 75,
      totalBuildingFees: 5,
    })
    expect(result.totals).toMatchObject({ tenantCount: 3, inactiveCount: 1, totalMonthlyFees: 85 })
  })

  it('keeps payments with unknown tenants in the grand total', () => {
    const result = summarizePaymentsByBuilding(
      buildings,
      [{ id: 10, building: 2 }],
      [
        { tenant: 10, amount: 100 },
        { tenant: 99, amount: 7 },
        { tenant: null, amount: 3 },
      ],
    )
    expect(result.buildings.map((b) => [b.name, b.total])).toEqual([
      ['A', 0],
      ['B', 100],
      ['Unassigned', 10],
    ])
    expect(result.grandTotal).toBe(110)
  })

  it('groups expenses by category, largest first', () => {
    const result = summarizeExpensesByCategory(
      [{ id: 1, name: 'Cleaning' }],
      [
        { category: 1, amount: 10 },
        { category: 1, amount: 5.55 },
        { category: 42, amount: 20 },
      ],
    )
    expect(result.categories).toEqual([
      { id: 'uncategorized', name: 'Uncategorized', totalAmount: 20, count: 1 },
      { id: '1', name: 'Cleaning', totalAmount: 15.55, count: 2 },
    ])
    expect(result.grandTotal).toBe(35.55)
  })
})

'use server'

import configPromise from '@/payload.config'
import { requireUser } from '@/server/auth'
import { getPayload, type Where } from 'payload'
import { BUSINESS_TIME_ZONE, DAY_MS, zonedParts, zonedStartOfMonth } from '@/lib/businessTime'
import {
  formatDateRange,
  parseDashboardFilter,
  resolveDashboardDateWindow,
} from '@/lib/dashboardDateFilter'
import { computeGeneratorDashboardStats, inWindow } from '@/lib/generatorStats'
import {
  DIESEL_FORECAST_DELIVERIES,
  averageMonthlyGeneratorCost,
  computeReceivablesAging,
  dieselPriceSeries,
  forecastDieselPrice,
  forecastGeneratorMaintenance,
  forecastRentCollection,
  summarizeDieselOutstanding,
  summarizeExpensesByCategory,
  summarizePaymentsByBuilding,
  summarizeRentCollection,
  summarizeTenantsByBuilding,
} from '@/lib/dashboardMetrics'

// Each dashboard view is served by ONE action that runs its queries in parallel: Next.js runs
// server actions from a client one at a time, so many small actions become a request waterfall.
// Failures are rethrown (not turned into zeros) so the UI can show an error instead of "$0.00".

const dateBetween = (start: Date, end: Date) => ({
  date: { greater_than_equal: start.toISOString(), less_than_equal: end.toISOString() },
})

export async function getDashboardPeriodData(rawFilter: unknown) {
  await requireUser()
  const filter = parseDashboardFilter(rawFilter)
  const now = new Date()
  const window = resolveDashboardDateWindow(filter, now)

  try {
    const payload = await getPayload({ config: configPromise })
    const monthPairs: Where[] = window.monthKeys.map((key) => {
      const [year, month] = key.split('-').map(Number)
      const clauses: Where[] = [{ periodYear: { equals: year } }, { periodMonth: { equals: month } }]
      return { and: clauses }
    })

    const [diesel, maintenance, hours, payments, invoices, expenses, buildings, tenants, categories] =
      await Promise.all([
        payload.find({
          collection: 'diesel-expenses',
          where: dateBetween(window.previousStart, window.end),
          select: { date: true, totalAmount: true, liters: true, pricePerLiter: true, pricePerThousandLiters: true },
          depth: 0,
          limit: 0,
          pagination: false,
        }),
        payload.find({
          collection: 'generator-expenses',
          where: dateBetween(window.previousStart, window.end),
          select: { date: true, amount: true },
          depth: 0,
          limit: 0,
          pagination: false,
        }),
        payload.find({
          collection: 'generator-hours',
          where: dateBetween(window.previousStart, window.end),
          select: { date: true, hoursRun: true },
          depth: 0,
          limit: 0,
          pagination: false,
        }),
        payload.find({
          collection: 'payments',
          where: dateBetween(window.start, window.end),
          select: { tenant: true, amount: true },
          depth: 0,
          limit: 0,
          pagination: false,
        }),
        payload.find({
          collection: 'invoices',
          where: { or: monthPairs },
          select: { totalAmount: true, amountPaid: true, isPaid: true, dueDate: true, periodYear: true, periodMonth: true },
          depth: 0,
          limit: 0,
          pagination: false,
        }),
        payload.find({
          collection: 'expenses',
          where: dateBetween(window.start, window.end),
          select: { category: true, amount: true },
          depth: 0,
          limit: 0,
          pagination: false,
        }),
        payload.find({
          collection: 'buildings',
          select: { name: true },
          sort: 'name',
          depth: 0,
          limit: 0,
          pagination: false,
        }),
        payload.find({
          collection: 'tenants',
          select: { building: true },
          depth: 0,
          limit: 0,
          pagination: false,
        }),
        payload.find({
          collection: 'expense-categories',
          select: { name: true },
          depth: 0,
          limit: 0,
          pagination: false,
        }),
      ])

    return {
      window: {
        start: window.start.toISOString(),
        end: window.end.toISOString(),
        label: formatDateRange(window.start, window.end),
        comparisonLabel: formatDateRange(window.previousStart, window.previousEnd),
        isPartial: window.isPartial,
      },
      generator: computeGeneratorDashboardStats(
        { dieselDocs: diesel.docs, maintenanceDocs: maintenance.docs, hourDocs: hours.docs },
        window,
      ),
      dieselPrices: dieselPriceSeries(inWindow(diesel.docs, window.start, window.end)),
      rent: summarizeRentCollection(invoices.docs, window.monthKeys, now),
      payments: summarizePaymentsByBuilding(buildings.docs, tenants.docs, payments.docs),
      expenses: summarizeExpensesByCategory(categories.docs, expenses.docs),
    }
  } catch (error) {
    console.error('Error loading dashboard period data:', error)
    throw new Error('Could not load dashboard data for this period')
  }
}

export type DashboardPeriodData = Awaited<ReturnType<typeof getDashboardPeriodData>>

/** Snapshot and forecast data that doesn't depend on the selected period. */
export async function getDashboardOverview() {
  await requireUser()
  const now = new Date()
  const today = zonedParts(now, BUSINESS_TIME_ZONE)
  const costHistoryStart = zonedStartOfMonth(today.year - 1, today.month)
  const invoiceHistoryYear = today.year - 1

  try {
    const payload = await getPayload({ config: configPromise })

    const [
      dieselUnpaid,
      recentDieselPrices,
      dieselCostHistory,
      maintenanceCostHistory,
      latestReading,
      lastOilChange,
      recentReadings,
      unpaidInvoices,
      recentInvoices,
      buildings,
      tenants,
    ] = await Promise.all([
      payload.find({
        collection: 'diesel-expenses',
        where: { or: [{ isPaid: { equals: false } }, { isPaid: { equals: null } }] },
        select: { totalAmount: true, amountPaid: true, isPaid: true },
        depth: 0,
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: 'diesel-expenses',
        select: { date: true, pricePerLiter: true, pricePerThousandLiters: true },
        sort: '-date',
        depth: 0,
        // A few extra in case the latest deliveries are missing a price.
        limit: DIESEL_FORECAST_DELIVERIES * 2,
      }),
      payload.find({
        collection: 'diesel-expenses',
        where: dateBetween(costHistoryStart, now),
        select: { date: true, totalAmount: true },
        depth: 0,
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: 'generator-expenses',
        where: dateBetween(costHistoryStart, now),
        select: { date: true, amount: true },
        depth: 0,
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: 'generator-hours',
        select: { date: true, meterReading: true },
        sort: '-date',
        depth: 0,
        limit: 1,
      }),
      payload.find({
        collection: 'generator-expenses',
        where: { expenseType: { equals: 'oil-change' } },
        select: { date: true, hours: true },
        sort: '-date',
        depth: 0,
        limit: 1,
      }),
      payload.find({
        collection: 'generator-hours',
        where: dateBetween(new Date(now.getTime() - 30 * DAY_MS), now),
        select: { date: true, meterReading: true },
        depth: 0,
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: 'invoices',
        where: { or: [{ isPaid: { equals: false } }, { isPaid: { equals: null } }] },
        select: { totalAmount: true, amountPaid: true, isPaid: true, dueDate: true },
        depth: 0,
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: 'invoices',
        where: { periodYear: { greater_than_equal: invoiceHistoryYear } },
        select: { totalAmount: true, amountPaid: true, isPaid: true, periodYear: true, periodMonth: true },
        depth: 0,
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: 'buildings',
        select: { name: true },
        sort: 'name',
        depth: 0,
        limit: 0,
        pagination: false,
      }),
      payload.find({
        collection: 'tenants',
        select: { building: true, active: true, ampsTaken: true, monthlyFee: true, buildingFee: true },
        depth: 0,
        limit: 0,
        pagination: false,
      }),
    ])

    return {
      dieselOutstanding: summarizeDieselOutstanding(dieselUnpaid.docs),
      dieselPriceForecast: forecastDieselPrice(recentDieselPrices.docs),
      monthlyGeneratorCost: averageMonthlyGeneratorCost(
        dieselCostHistory.docs,
        maintenanceCostHistory.docs,
        now,
      ),
      maintenance: forecastGeneratorMaintenance({
        latestReading: latestReading.docs[0],
        lastOilChange: lastOilChange.docs[0],
        recentReadings: recentReadings.docs,
        now,
      }),
      receivables: computeReceivablesAging(unpaidInvoices.docs, now),
      rentForecast: forecastRentCollection(recentInvoices.docs, now),
      tenants: summarizeTenantsByBuilding(buildings.docs, tenants.docs),
    }
  } catch (error) {
    console.error('Error loading dashboard overview:', error)
    throw new Error('Could not load dashboard overview')
  }
}

export type DashboardOverview = Awaited<ReturnType<typeof getDashboardOverview>>

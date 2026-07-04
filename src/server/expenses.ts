'use server'

import configPromise from '@/payload.config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import type { DateRange } from '@/components/ui/date-range-filter'
import {
  getGeneratorDashboardStats as getGeneratorDashboardStatsFromLib,
  type DashboardPeriod,
} from '@/lib/generatorStats'
import { remainingBalance, type DieselPayableDoc } from '@/lib/dieselExpenseBalance'
import { projectLinear } from '@/lib/forecast'

// Get the current user from payload
export async function getCurrentUser() {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    redirect('/admin/login?redirect=/')
  }
}

// Get expenses by date range
export async function getExpensesByDateRange(range: DateRange, monthIndex?: number) {
  try {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (range) {
      case 'month':
        // Show specific month (default to current month if no monthIndex provided)
        const targetMonth = monthIndex !== undefined ? monthIndex : now.getMonth()
        const targetYear = now.getFullYear()
        startDate = new Date(targetYear, targetMonth, 1)
        endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const payload = await getPayload({ config: configPromise })

    const expenses = await payload.find({
      collection: 'expenses',
      where: {
        date: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
      },
      sort: 'date',
    })

    console.log('Expenses', expenses.docs)
    return expenses.docs
  } catch (error) {
    console.error('Error getting expenses:', error)
    return []
  }
}

// Get diesel expenses by date range
export async function getDieselExpensesByDateRange(range: DateRange, monthIndex?: number) {
  try {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (range) {
      case 'month':
        // Show specific month (default to current month if no monthIndex provided)
        const targetMonth = monthIndex !== undefined ? monthIndex : now.getMonth()
        const targetYear = now.getFullYear()
        startDate = new Date(targetYear, targetMonth, 1)
        endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const payload = await getPayload({ config: configPromise })

    const expenses = await payload.find({
      collection: 'diesel-expenses',
      where: {
        date: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
      },
      sort: 'date',
      limit: 0,
    })

    return expenses.docs
  } catch (error) {
    console.error('Error getting diesel expenses:', error)
    return []
  }
}

// Get total diesel liters used in the current calendar month
export async function getCurrentMonthDieselLiters() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const payload = await getPayload({ config: configPromise })

    const expenses = await payload.find({
      collection: 'diesel-expenses',
      where: {
        date: {
          greater_than_equal: startOfMonth.toISOString(),
          less_than_equal: now.toISOString(),
        },
      },
      // Ensure all results for the month are included
      limit: 0,
    })

    const totalLiters = expenses.docs.reduce((sum, expense: any) => {
      const liters = Number((expense as any)?.liters) || 0
      return sum + liters
    }, 0)

    return totalLiters
  } catch (error) {
    console.error('Error calculating current month diesel liters:', error)
    return 0
  }
}

export type DieselOutstandingSummary = {
  /** Sum of remaining balances (invoice total minus amount paid). */
  totalOwed: number
  /** Invoices with a remaining balance greater than zero. */
  unpaidInvoiceCount: number
}

/**
 * Outstanding supplier balance for diesel: sum of (total − amount paid) per invoice,
 * including partial payments. Legacy rows without `amountPaid` infer full pay from `isPaid`.
 * Independent of dashboard date filters.
 */
export async function getDieselOutstandingSummary(): Promise<DieselOutstandingSummary> {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'diesel-expenses',
      where: {
        or: [{ isPaid: { equals: false } }, { isPaid: { equals: null } }],
      },
      sort: '-date',
      limit: 0,
    })

    let totalOwed = 0
    let unpaidInvoiceCount = 0

    for (const doc of result.docs) {
      const rem = remainingBalance(doc as DieselPayableDoc)
      if (rem > 0) {
        totalOwed += rem
        unpaidInvoiceCount += 1
      }
    }

    return {
      totalOwed,
      unpaidInvoiceCount,
    }
  } catch (error) {
    console.error('Error calculating diesel outstanding summary:', error)
    return {
      totalOwed: 0,
      unpaidInvoiceCount: 0,
    }
  }
}

// Get total diesel expenses (amount spent) in the current calendar month
export async function getCurrentMonthDieselExpenses() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const payload = await getPayload({ config: configPromise })

    const expenses = await payload.find({
      collection: 'diesel-expenses',
      where: {
        date: {
          greater_than_equal: startOfMonth.toISOString(),
          less_than_equal: now.toISOString(),
        },
      },
      // Ensure all results for the month are included
      limit: 0,
    })

    const totalAmount = expenses.docs.reduce((sum, expense: any) => {
      const amount = Number((expense as any)?.totalAmount) || 0
      return sum + amount
    }, 0)

    return totalAmount
  } catch (error) {
    console.error('Error calculating current month diesel expenses:', error)
    return 0
  }
}

// Get Building Payments
export async function getPaymentsByBuilding() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get all buildings
    const buildings = await payload.find({
      collection: 'buildings',
      sort: 'name',
    })

    // Get all payments with tenant and building information
    const payments = await payload.find({
      collection: 'payments',
      depth: 2,
      sort: 'date',
    })

    // Calculate totals by building
    const buildingTotals = buildings.docs.map((building) => {
      const buildingPayments = payments.docs.filter((payment) => {
        const tenant = payment.tenant as any
        return tenant?.building?.id === building.id
      })

      const total = buildingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

      return {
        id: building.id,
        name: building.name,
        total,
      }
    })

    // Calculate total of all buildings
    const grandTotal = buildingTotals.reduce((sum, building) => sum + building.total, 0)

    return {
      buildings: buildingTotals,
      grandTotal,
    }
  } catch (error) {
    console.error('Error getting Building Payments:', error)
    return {
      buildings: [],
      grandTotal: 0,
    }
  }
}

// Get generator expenses by date range
export async function getGeneratorExpensesByDateRange(range: DateRange, monthIndex?: number) {
  try {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (range) {
      case 'month':
        // Show specific month (default to current month if no monthIndex provided)
        const targetMonth = monthIndex !== undefined ? monthIndex : now.getMonth()
        const targetYear = now.getFullYear()
        startDate = new Date(targetYear, targetMonth, 1)
        endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const payload = await getPayload({ config: configPromise })

    const expenses = await payload.find({
      collection: 'generator-expenses',
      where: {
        date: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
      },
      sort: 'date',
    })

    return expenses.docs
  } catch (error) {
    console.error('Error getting generator expenses:', error)
    return []
  }
}

// Get generator expenses by category
export async function getGeneratorExpensesByCategory(range: DateRange, monthIndex?: number) {
  try {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (range) {
      case 'month':
        // Show specific month (default to current month if no monthIndex provided)
        const targetMonth = monthIndex !== undefined ? monthIndex : now.getMonth()
        const targetYear = now.getFullYear()
        startDate = new Date(targetYear, targetMonth, 1)
        endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const payload = await getPayload({ config: configPromise })

    const expenses = await payload.find({
      collection: 'generator-expenses',
      where: {
        date: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
      },
      sort: 'date',
    })

    // Group expenses by category
    const expensesByCategory = expenses.docs.reduce((acc: any, expense: any) => {
      const category = expense.expenseType
      if (!acc[category]) {
        acc[category] = {
          category,
          totalAmount: 0,
          count: 0,
          expenses: [],
        }
      }

      acc[category].totalAmount += expense.amount || 0
      acc[category].count += 1
      acc[category].expenses.push(expense)

      return acc
    }, {})

    // Convert to array and sort by total amount
    const categoryData = Object.values(expensesByCategory).sort(
      (a: any, b: any) => b.totalAmount - a.totalAmount,
    )

    // Calculate grand total
    const grandTotal = categoryData.reduce(
      (sum: number, category: any) => sum + category.totalAmount,
      0,
    )

    return {
      categories: categoryData,
      grandTotal,
    }
  } catch (error) {
    console.error('Error getting generator expenses by category:', error)
    return {
      categories: [],
      grandTotal: 0,
    }
  }
}

// Get tenant data by building
export async function getTenantsByBuilding() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get all buildings
    const buildings = await payload.find({
      collection: 'buildings',
      sort: 'name',
    })

    // Get ALL tenants (not just active ones) with building information
    // Use limit: 0 to get all tenants without pagination
    const tenants = await payload.find({
      collection: 'tenants',
      depth: 1,
      limit: 0,
      sort: 'name',
    })

    // Calculate tenant data by building
    const buildingData = await Promise.all(
      buildings.docs.map(async (building) => {
        // Query tenants for this specific building to ensure we get all of them
        const buildingTenantsQuery = await payload.find({
          collection: 'tenants',
          where: {
            building: {
              equals: building.id,
            },
          },
          depth: 1,
          limit: 0,
        })

        const buildingTenants = buildingTenantsQuery.docs

        const totalAmps = buildingTenants.reduce((sum, tenant) => {
          const amps = Number(tenant.ampsTaken) || 0
          return sum + amps
        }, 0)

        const totalMonthlyFees = buildingTenants.reduce((sum, tenant) => {
          const fee = Number(tenant.monthlyFee) || 0
          return sum + fee
        }, 0)

        const totalBuildingFees = buildingTenants.reduce((sum, tenant) => {
          const fee = Number(tenant.buildingFee) || 0
          return sum + fee
        }, 0)

        return {
          id: building.id,
          name: building.name,
          totalAmps,
          totalMonthlyFees,
          totalBuildingFees,
          tenantCount: buildingTenants.length,
        }
      }),
    )

    // Calculate grand totals
    const grandTotalAmps = buildingData.reduce((sum, building) => sum + building.totalAmps, 0)
    const grandTotalMonthlyFees = buildingData.reduce(
      (sum, building) => sum + building.totalMonthlyFees,
      0,
    )
    const grandTotalBuildingFees = buildingData.reduce(
      (sum, building) => sum + building.totalBuildingFees,
      0,
    )

    return {
      buildings: buildingData,
      grandTotalAmps,
      grandTotalMonthlyFees,
      grandTotalBuildingFees,
    }
  } catch (error) {
    console.error('Error getting tenants by building:', error)
    return {
      buildings: [],
      grandTotalAmps: 0,
      grandTotalMonthlyFees: 0,
      grandTotalBuildingFees: 0,
    }
  }
}

// Get generator hours by day
export async function getGeneratorHoursByDay(range: DateRange, monthIndex?: number) {
  try {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (range) {
      case 'month':
        // Show specific month (default to current month if no monthIndex provided)
        const targetMonth = monthIndex !== undefined ? monthIndex : now.getMonth()
        const targetYear = now.getFullYear()
        startDate = new Date(targetYear, targetMonth, 1)
        endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const payload = await getPayload({ config: configPromise })

    const hours = await payload.find({
      collection: 'generator-hours',
      where: {
        date: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
      },
      sort: 'date',
      limit: 0,
    })

    // Group by day and sum hours
    const hoursByDay = hours.docs.reduce((acc: any, reading: any) => {
      const date = new Date(reading.date)
      const dayKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

      if (!acc[dayKey]) {
        acc[dayKey] = {
          date: dayKey,
          hoursRun: 0,
          meterReading: reading.meterReading,
          readingCount: 0,
        }
      }

      acc[dayKey].hoursRun += reading.hoursRun || 0
      acc[dayKey].readingCount += 1
      // Keep the latest meter reading for the day
      acc[dayKey].meterReading = reading.meterReading

      return acc
    }, {})

    return Object.values(hoursByDay)
  } catch (error) {
    console.error('Error getting generator hours by day:', error)
    return []
  }
}

export async function getGeneratorDashboardStats(period: DashboardPeriod) {
  try {
    const payload = await getPayload({ config: configPromise })
    return await getGeneratorDashboardStatsFromLib(payload, period)
  } catch (error) {
    console.error('Error getting generator dashboard stats:', error)
    return null
  }
}

// Get general expenses grouped by expense category
export async function getExpensesByCategory(range: DateRange, monthIndex?: number) {
  try {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (range) {
      case 'month':
        const targetMonth = monthIndex !== undefined ? monthIndex : now.getMonth()
        const targetYear = now.getFullYear()
        startDate = new Date(targetYear, targetMonth, 1)
        endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const payload = await getPayload({ config: configPromise })

    const expenses = await payload.find({
      collection: 'expenses',
      depth: 1,
      where: {
        date: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
      },
      sort: 'date',
      limit: 0,
    })

    const expensesByCategory = expenses.docs.reduce((acc: any, expense: any) => {
      const category = expense.category
      const categoryId = typeof category === 'object' ? category?.id : category
      const categoryName = typeof category === 'object' ? category?.name : 'Uncategorized'

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: categoryName || 'Uncategorized',
          totalAmount: 0,
          count: 0,
        }
      }

      acc[categoryId].totalAmount += expense.amount || 0
      acc[categoryId].count += 1

      return acc
    }, {})

    const categoryData = Object.values(expensesByCategory).sort(
      (a: any, b: any) => b.totalAmount - a.totalAmount,
    )

    const grandTotal = categoryData.reduce(
      (sum: number, category: any) => sum + category.totalAmount,
      0,
    )

    return {
      categories: categoryData as Array<{ id: string; name: string; totalAmount: number; count: number }>,
      grandTotal,
    }
  } catch (error) {
    console.error('Error getting expenses by category:', error)
    return {
      categories: [],
      grandTotal: 0,
    }
  }
}

const getPricePerLiterUsd = (expense: { pricePerLiter?: number | null; pricePerThousandLiters?: number | null }): number => {
  const fromField = Number(expense.pricePerLiter)
  if (Number.isFinite(fromField) && fromField > 0) {
    return Math.round(fromField * 10000) / 10000
  }
  const perThousand = Number(expense.pricePerThousandLiters)
  if (Number.isFinite(perThousand) && perThousand > 0) {
    return Math.round((perThousand / 1000) * 10000) / 10000
  }
  return 0
}

export type DieselPriceForecast = {
  lastPrice: number | null
  projectedNextPrice: number | null
  trend: 'up' | 'down' | 'flat' | null
  pointsUsed: number
}

/**
 * Simple linear trend over historical diesel price-per-liter deliveries,
 * projected one delivery ahead. Purely trend-based, not a market forecast.
 */
export async function getDieselPriceForecast(): Promise<DieselPriceForecast> {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'diesel-expenses',
      sort: 'date',
      limit: 0,
    })

    const prices = result.docs
      .map((doc: any) => getPricePerLiterUsd(doc))
      .filter((price) => price > 0)

    if (prices.length === 0) {
      return { lastPrice: null, projectedNextPrice: null, trend: null, pointsUsed: 0 }
    }

    const lastPrice = prices[prices.length - 1]

    if (prices.length < 2) {
      return { lastPrice, projectedNextPrice: null, trend: null, pointsUsed: prices.length }
    }

    const points = prices.map((price, index) => ({ x: index, y: price }))
    const projectedNextPrice = projectLinear(points, points.length)

    let trend: DieselPriceForecast['trend'] = 'flat'
    if (projectedNextPrice !== null) {
      const delta = projectedNextPrice - lastPrice
      trend = Math.abs(delta) < 0.0005 ? 'flat' : delta > 0 ? 'up' : 'down'
    }

    return {
      lastPrice,
      projectedNextPrice: projectedNextPrice !== null ? Math.max(0, projectedNextPrice) : null,
      trend,
      pointsUsed: prices.length,
    }
  } catch (error) {
    console.error('Error getting diesel price forecast:', error)
    return { lastPrice: null, projectedNextPrice: null, trend: null, pointsUsed: 0 }
  }
}

const SERVICE_INTERVAL_HOURS = 250

export type GeneratorMaintenanceForecast = {
  hoursSinceService: number | null
  hoursRemaining: number | null
  estimatedDueDate: string | null
  avgHoursPerDay: number | null
}

/**
 * Estimates when the generator's next oil change is due. `SERVICE_INTERVAL_HOURS`
 * is a general-purpose assumption (no service-interval field exists on any
 * collection yet) — treat this as a rough estimate, not a maintenance schedule.
 */
export async function getGeneratorMaintenanceForecast(): Promise<GeneratorMaintenanceForecast> {
  try {
    const payload = await getPayload({ config: configPromise })

    const [latestReading, lastOilChange, recentReadings] = await Promise.all([
      payload.find({
        collection: 'generator-hours',
        sort: '-date',
        limit: 1,
      }),
      payload.find({
        collection: 'generator-expenses',
        where: { expenseType: { equals: 'oil-change' } },
        sort: '-date',
        limit: 1,
      }),
      payload.find({
        collection: 'generator-hours',
        sort: '-date',
        limit: 30,
      }),
    ])

    const currentMeterReading = Number(latestReading.docs[0]?.meterReading)
    if (!Number.isFinite(currentMeterReading)) {
      return { hoursSinceService: null, hoursRemaining: null, estimatedDueDate: null, avgHoursPerDay: null }
    }

    const lastServiceHours = Number(lastOilChange.docs[0]?.hours)
    const hoursSinceService = Number.isFinite(lastServiceHours)
      ? Math.max(0, currentMeterReading - lastServiceHours)
      : null

    const readings = recentReadings.docs
    const totalRecentHours = readings.reduce((sum, doc: any) => sum + (Number(doc.hoursRun) || 0), 0)
    const daySpan =
      readings.length > 1
        ? Math.max(
            1,
            (new Date(readings[0].date).getTime() - new Date(readings[readings.length - 1].date).getTime()) /
              86_400_000,
          )
        : null
    const avgHoursPerDay = daySpan ? totalRecentHours / daySpan : null

    if (hoursSinceService === null) {
      return { hoursSinceService: null, hoursRemaining: null, estimatedDueDate: null, avgHoursPerDay }
    }

    const hoursRemaining = Math.max(0, SERVICE_INTERVAL_HOURS - hoursSinceService)

    let estimatedDueDate: string | null = null
    if (avgHoursPerDay && avgHoursPerDay > 0) {
      const daysRemaining = Math.ceil(hoursRemaining / avgHoursPerDay)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + daysRemaining)
      estimatedDueDate = dueDate.toISOString()
    }

    return { hoursSinceService, hoursRemaining, estimatedDueDate, avgHoursPerDay }
  } catch (error) {
    console.error('Error getting generator maintenance forecast:', error)
    return { hoursSinceService: null, hoursRemaining: null, estimatedDueDate: null, avgHoursPerDay: null }
  }
}

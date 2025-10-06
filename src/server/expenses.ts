'use server'

import configPromise from '@/payload.config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import type { DateRange } from '@/components/ui/date-range-filter'

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
export async function getExpensesByDateRange(range: DateRange) {
  try {
    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
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
          less_than_equal: now.toISOString(),
        },
      },
      sort: '-date',
    })

    console.log('Expenses', expenses.docs)
    return expenses.docs
  } catch (error) {
    console.error('Error getting expenses:', error)
    return []
  }
}

// Get diesel expenses by date range
export async function getDieselExpensesByDateRange(range: DateRange) {
  try {
    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
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
          less_than_equal: now.toISOString(),
        },
      },
      sort: '-date',
    })

    return expenses.docs
  } catch (error) {
    console.error('Error getting diesel expenses:', error)
    return []
  }
}

// Get payments by building
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
      sort: '-date',
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
    console.error('Error getting payments by building:', error)
    return {
      buildings: [],
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

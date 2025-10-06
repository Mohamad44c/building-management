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

    const currentUser = await getCurrentUser()
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

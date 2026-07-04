'use server'

import configPromise from '@/payload.config'
import { getPayload } from 'payload'
import { renderInvoicePdfBuffer } from '@/lib/InvoicePdfDocument'
import type { InvoiceLineItem } from '@/lib/invoiceCalc'
import { effectiveAmountPaid, remainingBalance, roundCents } from '@/lib/dieselExpenseBalance'
import { movingAverage, projectLinear } from '@/lib/forecast'

type GenerateInvoicePdfResult =
  | { success: true; pdfUrl: string; pdfFileId: string }
  | { success: false; error: string }

export async function generateInvoicePdf(invoiceId: string): Promise<GenerateInvoicePdfResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    const invoice = await payload.findByID({ collection: 'invoices', id: invoiceId, depth: 2 })
    if (!invoice) {
      return { success: false, error: 'Invoice not found' }
    }

    const tenant = invoice.tenant && typeof invoice.tenant === 'object' ? invoice.tenant : null
    const building = invoice.building && typeof invoice.building === 'object' ? invoice.building : null

    if (!invoice.periodMonth || !invoice.periodYear) {
      return { success: false, error: 'Invoice is missing a billing period' }
    }

    const buffer = await renderInvoicePdfBuffer({
      tenantName: tenant?.name ?? 'Unknown Tenant',
      buildingName: building?.name ?? '',
      periodMonth: invoice.periodMonth,
      periodYear: invoice.periodYear,
      dueDate: invoice.dueDate,
      lineItems: (invoice.lineItems ?? []) as InvoiceLineItem[],
      totalAmount: invoice.totalAmount ?? 0,
      isPaid: Boolean(invoice.isPaid),
    })

    const filename = `invoice-${invoice.id}-${invoice.periodYear}-${invoice.periodMonth}.pdf`
    const media = await payload.create({
      collection: 'invoice-pdfs',
      data: {},
      file: {
        data: buffer,
        mimetype: 'application/pdf',
        name: filename,
        size: buffer.length,
      },
    })

    await payload.update({
      collection: 'invoices',
      id: invoiceId,
      data: { pdfFile: media.id, status: 'generated' },
    })

    return {
      success: true,
      pdfUrl: media.url ?? `/api/invoice-pdfs/file/${media.filename}`,
      pdfFileId: String(media.id),
    }
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating invoice PDF',
    }
  }
}

type InvoiceDoc = {
  totalAmount?: number | null
  amountPaid?: number | null
  isPaid?: boolean | null
  dueDate?: string | null
  periodMonth?: number | null
  periodYear?: number | null
}

const invoicePeriodDate = (doc: InvoiceDoc): Date | null => {
  if (!doc.periodYear || !doc.periodMonth) return null
  return new Date(doc.periodYear, doc.periodMonth - 1, 1)
}

export type RentCollectionSummary = {
  totalBilled: number
  totalCollected: number
  outstanding: number
  collectionRatePct: number | null
  overdueCount: number
  invoiceCount: number
}

/**
 * Rent collection for the selected period, keyed off each invoice's billing period
 * (periodMonth/periodYear), not the date it happened to be created or paid.
 */
export async function getRentCollectionSummary(
  startDate: string,
  endDate: string,
): Promise<RentCollectionSummary> {
  try {
    const payload = await getPayload({ config: configPromise })
    const windowStart = new Date(startDate)
    const windowEnd = new Date(endDate)

    const result = await payload.find({
      collection: 'invoices',
      limit: 0,
    })

    const now = new Date()
    let totalBilled = 0
    let totalCollected = 0
    let overdueCount = 0
    let invoiceCount = 0

    for (const doc of result.docs as InvoiceDoc[]) {
      const periodDate = invoicePeriodDate(doc)
      if (!periodDate || periodDate < windowStart || periodDate > windowEnd) continue

      invoiceCount += 1
      totalBilled += roundCents(Number(doc.totalAmount) || 0)
      totalCollected += effectiveAmountPaid({
        totalAmount: doc.totalAmount,
        amountPaid: doc.amountPaid,
        isPaid: doc.isPaid,
      })

      if (doc.dueDate && !doc.isPaid && new Date(doc.dueDate) < now) {
        overdueCount += 1
      }
    }

    const outstanding = Math.max(0, roundCents(totalBilled - totalCollected))

    return {
      totalBilled,
      totalCollected,
      outstanding,
      collectionRatePct: totalBilled > 0 ? roundCents((totalCollected / totalBilled) * 100) : null,
      overdueCount,
      invoiceCount,
    }
  } catch (error) {
    console.error('Error getting rent collection summary:', error)
    return {
      totalBilled: 0,
      totalCollected: 0,
      outstanding: 0,
      collectionRatePct: null,
      overdueCount: 0,
      invoiceCount: 0,
    }
  }
}

export type ReceivablesAgingBucket = {
  bucket: '0-30' | '31-60' | '61-90' | '90+'
  totalOwed: number
  invoiceCount: number
}

export type ReceivablesAging = {
  buckets: ReceivablesAgingBucket[]
  totalOwed: number
}

/**
 * Outstanding invoice balances bucketed by how many days past `dueDate` they are.
 * Independent of the dashboard period filter, mirroring getDieselOutstandingSummary.
 */
export async function getReceivablesAging(): Promise<ReceivablesAging> {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'invoices',
      where: {
        or: [{ isPaid: { equals: false } }, { isPaid: { equals: null } }],
      },
      limit: 0,
    })

    const now = new Date()
    const buckets: ReceivablesAgingBucket[] = [
      { bucket: '0-30', totalOwed: 0, invoiceCount: 0 },
      { bucket: '31-60', totalOwed: 0, invoiceCount: 0 },
      { bucket: '61-90', totalOwed: 0, invoiceCount: 0 },
      { bucket: '90+', totalOwed: 0, invoiceCount: 0 },
    ]

    for (const doc of result.docs as InvoiceDoc[]) {
      const owed = remainingBalance({
        totalAmount: doc.totalAmount,
        amountPaid: doc.amountPaid,
        isPaid: doc.isPaid,
      })
      if (owed <= 0) continue

      const dueDate = doc.dueDate ? new Date(doc.dueDate) : now
      const daysPastDue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / 86_400_000))

      const bucketIndex = daysPastDue <= 30 ? 0 : daysPastDue <= 60 ? 1 : daysPastDue <= 90 ? 2 : 3
      buckets[bucketIndex].totalOwed = roundCents(buckets[bucketIndex].totalOwed + owed)
      buckets[bucketIndex].invoiceCount += 1
    }

    const totalOwed = roundCents(buckets.reduce((sum, b) => sum + b.totalOwed, 0))

    return { buckets, totalOwed }
  } catch (error) {
    console.error('Error getting receivables aging:', error)
    return {
      buckets: [
        { bucket: '0-30', totalOwed: 0, invoiceCount: 0 },
        { bucket: '31-60', totalOwed: 0, invoiceCount: 0 },
        { bucket: '61-90', totalOwed: 0, invoiceCount: 0 },
        { bucket: '90+', totalOwed: 0, invoiceCount: 0 },
      ],
      totalOwed: 0,
    }
  }
}

export type RentCollectionForecast = {
  history: Array<{ label: string; billed: number; collected: number }>
  projectedNextMonth: number | null
  monthsUsed: number
}

/**
 * Projects next month's expected rent collection from the last 6 completed
 * calendar months of invoices, using a linear trend over the collected series
 * (falls back to a moving average when the trend can't be computed).
 */
export async function getRentCollectionForecast(): Promise<RentCollectionForecast> {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'invoices',
      limit: 0,
    })

    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`

    const monthlyTotals = new Map<string, { billed: number; collected: number }>()

    for (const doc of result.docs as InvoiceDoc[]) {
      const periodDate = invoicePeriodDate(doc)
      if (!periodDate) continue
      const key = `${periodDate.getFullYear()}-${`${periodDate.getMonth() + 1}`.padStart(2, '0')}`
      if (key >= currentMonthKey) continue // only completed months

      const entry = monthlyTotals.get(key) ?? { billed: 0, collected: 0 }
      entry.billed = roundCents(entry.billed + (Number(doc.totalAmount) || 0))
      entry.collected = roundCents(
        entry.collected +
          effectiveAmountPaid({
            totalAmount: doc.totalAmount,
            amountPaid: doc.amountPaid,
            isPaid: doc.isPaid,
          }),
      )
      monthlyTotals.set(key, entry)
    }

    const orderedKeys = Array.from(monthlyTotals.keys())
      .sort((a, b) => a.localeCompare(b))
      .slice(-6)

    const history = orderedKeys.map((key) => {
      const [year, month] = key.split('-').map(Number)
      const label = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
      const entry = monthlyTotals.get(key)!
      return { label, billed: entry.billed, collected: entry.collected }
    })

    if (history.length === 0) {
      return { history: [], projectedNextMonth: null, monthsUsed: 0 }
    }

    const points = history.map((point, index) => ({ x: index, y: point.collected }))
    const projected =
      projectLinear(points, points.length) ?? movingAverage(history.map((h) => h.collected), 3)

    return {
      history,
      projectedNextMonth: projected !== null ? Math.max(0, roundCents(projected)) : null,
      monthsUsed: history.length,
    }
  } catch (error) {
    console.error('Error getting rent collection forecast:', error)
    return { history: [], projectedNextMonth: null, monthsUsed: 0 }
  }
}

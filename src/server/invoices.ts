'use server'

import configPromise from '@/payload.config'
import { requireUser } from '@/server/auth'
import { getPayload } from 'payload'
import { renderInvoicePdfBuffer } from '@/lib/InvoicePdfDocument'
import { renderReceiptPdfBuffer } from '@/lib/ReceiptPdfDocument'
import type { InvoiceLineItem } from '@/lib/invoiceCalc'
import { effectiveAmountPaid, remainingBalance } from '@/lib/dieselExpenseBalance'
import { sanitizeS3PathSegment } from '@/lib/s3Path'

type GenerateInvoicePdfResult =
  | { success: true; pdfUrl: string; pdfFileId: string }
  | { success: false; error: string }

type GenerateReceiptPdfResult =
  | { success: true; pdfUrl: string; pdfFileId: string }
  | { success: false; error: string }

export async function generateInvoicePdf(invoiceId: string): Promise<GenerateInvoicePdfResult> {
  try {
    await requireUser()
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

    const buildingSegment = sanitizeS3PathSegment(building?.name ?? 'unknown')
    const tenantSegment = sanitizeS3PathSegment(tenant?.name ?? 'unknown-tenant')
    const dateSegment = new Date().toISOString().slice(0, 10)
    const filename = `${tenantSegment}-${dateSegment}-invoice.pdf`
    const media = await payload.create({
      collection: 'invoice-pdfs',
      // `prefix` is injected by the s3Storage plugin at runtime and isn't in the generated types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { prefix: `building/${buildingSegment}/invoices` } as any,
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

export async function generateReceiptPdf(invoiceId: string): Promise<GenerateReceiptPdfResult> {
  try {
    await requireUser()
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

    const amountPaid = effectiveAmountPaid({
      totalAmount: invoice.totalAmount,
      amountPaid: invoice.amountPaid,
      isPaid: invoice.isPaid,
    })

    if (amountPaid <= 0) {
      return { success: false, error: 'No payment has been recorded for this invoice yet' }
    }

    const balance = remainingBalance({
      totalAmount: invoice.totalAmount,
      amountPaid: invoice.amountPaid,
      isPaid: invoice.isPaid,
    })

    const issueDate = new Date().toISOString()
    const receiptNumber = `RCPT-${invoice.id}-${Date.now()}`

    const buffer = await renderReceiptPdfBuffer({
      receiptNumber,
      issueDate,
      tenantName: tenant?.name ?? 'Unknown Tenant',
      buildingName: building?.name ?? '',
      periodMonth: invoice.periodMonth,
      periodYear: invoice.periodYear,
      amountPaid,
      totalAmount: invoice.totalAmount ?? 0,
      remainingBalance: balance,
    })

    const buildingSegment = sanitizeS3PathSegment(building?.name ?? 'unknown')
    const tenantSegment = sanitizeS3PathSegment(tenant?.name ?? 'unknown-tenant')
    const dateSegment = issueDate.slice(0, 10)
    const filename = `${tenantSegment}-${dateSegment}-receipt.pdf`
    const media = await payload.create({
      collection: 'receipt-pdfs',
      // `prefix` is injected by the s3Storage plugin at runtime and isn't in the generated types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { prefix: `building/${buildingSegment}/receipts` } as any,
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
      data: { receiptFile: media.id },
    })

    return {
      success: true,
      pdfUrl: media.url ?? `/api/receipt-pdfs/file/${media.filename}`,
      pdfFileId: String(media.id),
    }
  } catch (error) {
    console.error('Error generating receipt PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating receipt PDF',
    }
  }
}

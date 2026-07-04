'use server'

import configPromise from '@/payload.config'
import { getPayload } from 'payload'
import { renderInvoicePdfBuffer } from '@/lib/InvoicePdfDocument'
import type { InvoiceLineItem } from '@/lib/invoiceCalc'

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

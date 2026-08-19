import type { CollectionConfig } from 'payload'

export const ReceiptPdfs: CollectionConfig = {
  slug: 'receipt-pdfs',
  admin: {
    group: 'All Expenses',
    hidden: true,
  },
  upload: {
    staticDir: 'receipt-pdfs',
    mimeTypes: ['application/pdf'],
  },
  fields: [],
}

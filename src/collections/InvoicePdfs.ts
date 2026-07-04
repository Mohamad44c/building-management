import type { CollectionConfig } from 'payload'

export const InvoicePdfs: CollectionConfig = {
  slug: 'invoice-pdfs',
  admin: {
    group: 'All Expenses',
    hidden: true,
  },
  upload: {
    staticDir: 'invoice-pdfs',
    mimeTypes: ['application/pdf'],
  },
  fields: [],
}

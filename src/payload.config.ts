import { s3Storage } from '@payloadcms/storage-s3'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { ExpenseCategories } from './collections/ExpenseCategories'
import { Expenses } from './collections/Expenses'
import { DieselExpenses } from './collections/DieselExpenses'
import { GeneratorExpenses } from './collections/GeneratorExpenses'
import { GeneratorHours } from './collections/GeneratorHours'
import { Buildings } from './collections/Buildings'
import { Tenants } from './collections/Tenants'
import { Payments } from './collections/Payments'
import { Invoices } from './collections/Invoices'
import { InvoicePdfs } from './collections/InvoicePdfs'
import { ReceiptPdfs } from './collections/ReceiptPdfs'
 
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      actions: ['/components/admin/OpenDashboardButton#OpenDashboardButton'],
    },
  },
  collections: [
    Expenses,
    DieselExpenses,
    GeneratorExpenses,
    GeneratorHours,
    Payments,
    ExpenseCategories,
    Buildings,
    Tenants,
    Invoices,
    InvoicePdfs,
    ReceiptPdfs,
    Users,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: { 'invoice-pdfs': true, 'receipt-pdfs': true },
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
})

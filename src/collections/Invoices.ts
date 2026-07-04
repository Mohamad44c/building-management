import type { CollectionConfig } from 'payload'
import { syncInvoicePaymentFields } from './invoiceHooks'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  hooks: {
    beforeChange: [syncInvoicePaymentFields],
  },
  admin: {
    useAsTitle: 'id',
    group: 'All Expenses',
    defaultColumns: [
      'tenant',
      'periodMonth',
      'periodYear',
      'totalAmount',
      'amountPaid',
      'isPaid',
      'dueDate',
    ],
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/GenerateInvoicePdfButton#GenerateInvoicePdfButton'],
      },
    },
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'building',
      type: 'relationship',
      relationTo: 'buildings',
      admin: {
        readOnly: true,
        description: 'Auto-populated from the tenant when the invoice is created',
      },
    },
    {
      name: 'periodMonth',
      type: 'number',
      required: true,
      min: 1,
      max: 12,
      admin: {
        description: 'Billing period month (1-12)',
      },
    },
    {
      name: 'periodYear',
      type: 'number',
      required: true,
      admin: {
        description: 'Billing period year',
      },
    },
    {
      name: 'dueDate',
      type: 'date',
    },
    {
      name: 'lineItems',
      type: 'array',
      admin: {
        description:
          'Fixed fees are auto-populated from the tenant when the invoice is created. Add ad-hoc items (diesel surcharge, maintenance, etc.) manually.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'kind',
          type: 'select',
          options: ['fixed', 'adhoc'],
          defaultValue: 'adhoc',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'totalAmount',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Sum of line items',
      },
    },
    {
      name: 'amountPaid',
      type: 'number',
      label: 'Amount paid (USD)',
      min: 0,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        step: 0.01,
        description: 'How much has been paid toward this invoice. Cannot exceed the invoice total.',
      },
    },
    {
      name: 'isPaid',
      type: 'checkbox',
      label: 'Is Paid',
      defaultValue: false,
      admin: {
        description:
          'Checked automatically when amount paid reaches the total. You can check to record full payment, or uncheck to reopen a settled invoice.',
        components: {
          Cell: '/components/cells/IsPaidCell#IsPaidCell',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'generated'],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'pdfFile',
      type: 'relationship',
      relationTo: 'invoice-pdfs',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set automatically after PDF generation',
      },
    },
  ],
}

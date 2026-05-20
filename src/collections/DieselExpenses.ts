import type { CollectionConfig } from 'payload'
import { syncDieselPaymentFields } from './dieselExpenseHooks'

export const DieselExpenses: CollectionConfig = {
  slug: 'diesel-expenses',
  hooks: {
    beforeChange: [syncDieselPaymentFields],
  },
  admin: {
    useAsTitle: 'date',
    defaultColumns: [
      'pricePerThousandLiters',
      'amountPaid',
      'totalAmount',
      'isPaid',
      'liters',
      'date',
    ],
    group: 'All Expenses',
  },
  fields: [
    {
      name: 'pricePerThousandLiters',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'liters',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'pricePerLiter',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Automatically calculated from price per 1000 liters',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.pricePerThousandLiters) {
              return data.pricePerThousandLiters / 1000
            }
            return 0
          },
        ],
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'totalAmount',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total amount in USD',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.pricePerThousandLiters && data.liters) {
              return Math.round((data.pricePerThousandLiters / 1000) * data.liters * 100) / 100
            }
            return 0
          },
        ],
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
  ],
}

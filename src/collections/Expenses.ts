import type { CollectionConfig } from 'payload'

export const Expenses: CollectionConfig = {
  slug: 'expenses',
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['category', 'amount', 'date', 'description'],
    group: 'All Expenses',
  },
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'expense-categories',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
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
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        step: 0.01,
      },
    },
  ],
}

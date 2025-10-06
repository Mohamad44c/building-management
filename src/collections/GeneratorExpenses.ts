import type { CollectionConfig } from 'payload'

export const GeneratorExpenses: CollectionConfig = {
  slug: 'generator-expenses',
  admin: {
    useAsTitle: 'expenseType',
    defaultColumns: ['expenseType', 'amount', 'notes', 'date'],
    group: 'All Expenses',
  },
  fields: [
    {
      name: 'expenseType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Oil Change',
          value: 'oil-change',
        },
        {
          label: 'Filters',
          value: 'filters',
        },
        {
          label: 'Parts',
          value: 'parts',
        },
        {
          label: 'Labor',
          value: 'labor',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      admin: {
        description: 'Select the type of generator expense',
      },
    },
    {
      name: 'hours',
      type: 'number',
      min: 0,
      admin: {
        step: 0.1,
        description: 'Hours for oil change (only applicable for Oil Change)',
        condition: (data) => data?.expenseType === 'oil-change',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        step: 0.01,
        description: 'Amount paid in USD',
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
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes about this expense',
        rows: 3,
      },
    },
  ],
}

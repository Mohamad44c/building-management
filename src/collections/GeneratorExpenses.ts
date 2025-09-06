import type { CollectionConfig } from 'payload'

export const GeneratorExpenses: CollectionConfig = {
  slug: 'generator-expenses',
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['pricePerThousandLiters', 'liters', 'pricePerLiter', 'date'],
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
              return (data.pricePerThousandLiters / 1000) * data.liters
            }
            return 0
          },
        ],
      },
    },
  ],
}

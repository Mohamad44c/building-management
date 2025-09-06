import type { CollectionConfig } from 'payload'

export const ExpenseCategories: CollectionConfig = {
  slug: 'expense-categories',
  admin: {
    useAsTitle: 'name',
    group: 'Info',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
  ],
}

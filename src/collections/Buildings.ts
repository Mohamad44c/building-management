import type { CollectionConfig } from 'payload'

export const Buildings: CollectionConfig = {
  slug: 'buildings',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'address'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'address',
      type: 'textarea',
      required: false,
    },
  ],
}

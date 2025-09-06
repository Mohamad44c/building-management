import type { CollectionConfig } from 'payload'

export const Buildings: CollectionConfig = {
  slug: 'buildings',
  admin: {
    useAsTitle: 'name',
      defaultColumns: ['name', 'address'],
    group: 'Info',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        placeholder: 'Enter building name',
      },
    },
    {
      name: 'address',
      type: 'textarea',
      required: false,
    },
  ],
}

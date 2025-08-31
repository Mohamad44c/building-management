import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'phoneNumber',
      'building',
      'monthlyFee',
      'ampsTaken',
      'buildingFloor',
      'pastDueBalance',
      'active',
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
    },
    {
      name: 'building',
      type: 'relationship',
      relationTo: 'buildings',
      required: true,
    },
    {
      name: 'monthlyFee',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Is this tenant currently active?',
      },
    },
    {
      name: 'ampsTaken',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Number of amps taken by the tenant',
      },
    },
    {
      name: 'buildingFloor',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Floor number where the tenant is located',
      },
    },
    {
      name: 'pastDueBalance',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        step: 0.01,
        description: 'Accumulated unpaid balance from previous payments',
        position: 'sidebar',
      },
    },
  ],
}

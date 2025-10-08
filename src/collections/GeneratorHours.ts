import type { CollectionConfig } from 'payload'

export const GeneratorHours: CollectionConfig = {
  slug: 'generator-hours',
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['meterReading', 'hoursRun', 'date', 'notes'],
    group: 'Generator',
  },
  fields: [
    {
      name: 'meterReading',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        step: 1,
        description: 'Current cumulative hours on the generator meter (e.g., 27000)',
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
        description: 'Date and time of this reading',
      },
    },
    {
      name: 'hoursRun',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Hours run since last reading (automatically calculated)',
      },
      hooks: {
        beforeChange: [
          async ({ data, req, operation }) => {
            // Only calculate for new entries or updates
            if (!data?.meterReading) return 0

            try {
              // Find the most recent previous reading
              const previousReadings = await req.payload.find({
                collection: 'generator-hours',
                sort: '-date',
                limit: 1,
                where: {
                  date: {
                    less_than: data.date || new Date(),
                  },
                },
              })

              if (previousReadings.docs.length > 0) {
                const previousReading = previousReadings.docs[0]
                const hoursDiff = data.meterReading - (previousReading.meterReading || 0)
                return Math.max(0, hoursDiff) // Ensure non-negative
              }

              return 0 // First reading
            } catch (error) {
              console.error('Error calculating hours run:', error)
              return 0
            }
          },
        ],
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Optional notes about this reading',
        rows: 3,
      },
    },
  ],
}

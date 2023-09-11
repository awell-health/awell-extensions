import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  bookingId: {
    key: 'bookingId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

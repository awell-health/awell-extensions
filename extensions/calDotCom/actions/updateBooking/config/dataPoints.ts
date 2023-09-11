import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  bookingId: {
    key: 'bookingId',
    valueType: 'string',
  },
  bookingUid: {
    key: 'bookingUid',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

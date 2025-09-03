import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  bookingId: {
    key: 'bookingId',
    valueType: 'string',
  },
  defaultName: {
    key: 'defaultName',
    valueType: 'string',
  },
  defaultEmail: {
    key: 'defaultEmail',
    valueType: 'string',
  },
  defaultPhone: {
    key: 'defaultPhone',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  messageSid: {
    // unique string to identify the Message resource, can be used to cancel the message if needed
    key: 'messageSid',
    valueType: 'string',
  },
  scheduled: {
    key: 'scheduled',
    valueType: 'boolean',
  },
  sendAt: {
    key: 'sendAt',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>

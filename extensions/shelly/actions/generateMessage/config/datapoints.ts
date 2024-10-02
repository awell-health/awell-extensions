import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  subject: {
    key: 'subject',
    valueType: 'string',
  },
  message: {
    key: 'message',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

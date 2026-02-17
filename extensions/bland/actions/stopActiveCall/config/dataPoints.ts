import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  status: {
    key: 'status',
    valueType: 'string',
  },
  message: {
    key: 'message',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

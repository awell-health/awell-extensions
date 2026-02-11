import { type DataPointDefinition } from '@awell-health/extensions-core'

export const networkQueryDataPoints = {
  requestId: {
    key: 'requestId',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  sessionId: {
    key: 'sessionId',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  startedAt: {
    key: 'startedAt',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  sessionId: {
    key: 'sessionId',
    valueType: 'string',
  },
  statusCode: {
    key: 'statusCode',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

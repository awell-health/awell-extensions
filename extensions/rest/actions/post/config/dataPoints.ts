import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  response: {
    key: 'response',
    valueType: 'json',
  },
  statusCode: {
    key: 'statusCode',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

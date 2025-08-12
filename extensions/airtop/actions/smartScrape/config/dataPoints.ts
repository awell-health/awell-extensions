import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  result: {
    key: 'result',
    valueType: 'string',
  },
  mimeType: {
    key: 'mimeType',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  parsedData: {
    key: 'parsedData',
    valueType: 'json',
  },
  explanation: {
    key: 'explanation',
    valueType: 'string',
  },
  confidenceLevel: {
    key: 'confidenceLevel',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  data: {
    key: 'data',
    valueType: 'string',
  },
  jsonData: {
    key: 'jsonData',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  category: {
    key: 'category',
    valueType: 'string',
  },
  explanation: {
    key: 'explanation',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

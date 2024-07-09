import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  sum: {
    key: 'sum',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

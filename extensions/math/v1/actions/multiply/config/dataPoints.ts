import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  product: {
    key: 'product',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

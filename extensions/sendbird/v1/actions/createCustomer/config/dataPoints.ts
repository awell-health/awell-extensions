import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  customerId: {
    key: 'customerId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

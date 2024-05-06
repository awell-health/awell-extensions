import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  subscriptionId: {
    key: 'subscriptionId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

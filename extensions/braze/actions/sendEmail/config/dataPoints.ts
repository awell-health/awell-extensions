import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  dispatchId: {
    key: 'dispatchId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

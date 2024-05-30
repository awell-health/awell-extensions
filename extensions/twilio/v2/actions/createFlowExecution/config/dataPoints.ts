import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  executionId: {
    key: 'executionId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

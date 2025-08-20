import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  status: {
    key: 'status',
    valueType: 'string',
  },
  stoppedAt: {
    key: 'stoppedAt',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

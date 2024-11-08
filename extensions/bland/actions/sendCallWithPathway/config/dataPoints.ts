import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  callId: {
    key: 'callId',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

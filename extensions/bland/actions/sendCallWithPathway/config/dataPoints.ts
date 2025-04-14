import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  call_id: {
    key: 'call_id',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

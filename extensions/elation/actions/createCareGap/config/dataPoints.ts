import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  id: {
    key: 'id',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

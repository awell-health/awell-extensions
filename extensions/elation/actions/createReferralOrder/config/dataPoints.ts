import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  id: {
    key: 'id',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

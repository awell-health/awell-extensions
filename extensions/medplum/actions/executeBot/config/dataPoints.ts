import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  data: {
    key: 'data',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

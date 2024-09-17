import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  data: {
    key: 'data',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

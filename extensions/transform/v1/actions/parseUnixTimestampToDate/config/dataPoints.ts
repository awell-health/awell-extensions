import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  date: {
    key: 'date',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>

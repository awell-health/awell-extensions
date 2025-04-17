import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  nextWorkday: {
    key: 'nextWorkday',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>

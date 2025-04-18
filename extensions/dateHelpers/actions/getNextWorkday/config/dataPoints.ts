import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  nextWorkday: {
    key: 'nextWorkday',
    valueType: 'date',
  },
  referenceDateIsWeekday: {
    key: 'referenceDateIsWeekday',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

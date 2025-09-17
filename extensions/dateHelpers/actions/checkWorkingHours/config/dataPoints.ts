import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  isWithinWorkingHours: {
    key: 'isWithinWorkingHours',
    valueType: 'boolean',
  },
  minutesToNextWorkingHours: {
    key: 'minutesToNextWorkingHours',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

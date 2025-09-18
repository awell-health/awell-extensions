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
  nextWorkingHoursDatetime: {
    key: 'nextWorkingHoursDatetime',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>

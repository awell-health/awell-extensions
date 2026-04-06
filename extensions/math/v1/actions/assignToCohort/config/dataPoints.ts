import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  cohortNumber: {
    key: 'cohortNumber',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

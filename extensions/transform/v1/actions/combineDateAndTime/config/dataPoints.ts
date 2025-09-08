import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  combinedDateTime: {
    key: 'combinedDateTime',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>

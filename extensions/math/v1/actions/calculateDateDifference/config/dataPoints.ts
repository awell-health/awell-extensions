import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  dateDifference: {
    key: 'dateDifference',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

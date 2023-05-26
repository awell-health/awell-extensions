import { type DataPointDefinition } from '@awell-health/awell-extensions-types'

export const dataPoints = {
  dateDifference: {
    key: 'dateDifference',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  difference: {
    key: 'difference',
    valueType: 'number',
  },
  absoluteDifference: {
    key: 'absoluteDifference',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

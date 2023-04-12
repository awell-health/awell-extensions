import { type DataPointDefinition } from '../../../../../../lib/types'

export const dataPoints = {
  dateDifference: {
    key: 'dateDifference',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

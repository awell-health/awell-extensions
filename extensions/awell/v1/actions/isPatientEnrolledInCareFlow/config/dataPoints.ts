import { type DataPointDefinition } from '../../../../../../lib/types'

export const dataPoints = {
  result: {
    key: 'result',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

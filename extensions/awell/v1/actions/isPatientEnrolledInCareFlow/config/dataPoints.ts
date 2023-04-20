import { type DataPointDefinition } from '../../../../../../lib/types'

export const dataPoints = {
  result: {
    key: 'result',
    valueType: 'boolean',
  },
  careFlowIds: {
    key: 'careFlowIds',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

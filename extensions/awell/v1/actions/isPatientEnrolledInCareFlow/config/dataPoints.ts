import { type DataPointDefinition } from '@awell-health/awell-extensions-types'

export const dataPoints = {
  result: {
    key: 'result',
    valueType: 'boolean',
  },
  nbrOfResults: {
    key: 'nbrOfResults',
    valueType: 'number',
  },
  careFlowIds: {
    key: 'careFlowIds',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

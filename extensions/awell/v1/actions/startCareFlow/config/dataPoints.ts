import { type DataPointDefinition } from '@awell-health/awell-extensions-types'

export const dataPoints = {
  careFlowId: {
    key: 'careFlowId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

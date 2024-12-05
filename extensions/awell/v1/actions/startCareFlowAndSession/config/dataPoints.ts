import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  careFlowId: {
    key: 'careFlowId',
    valueType: 'string',
  },
  sessionUrl: {
    key: 'sessionUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

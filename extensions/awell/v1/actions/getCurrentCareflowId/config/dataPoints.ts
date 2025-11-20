import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  careFlowId: {
    key: 'careFlowId',
    valueType: 'string',
  },
  careFlowDefinitionId: {
    key: 'careFlowDefinitionId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

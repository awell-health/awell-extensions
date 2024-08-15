import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  interactionId: {
    key: 'interactionId',
    valueType: 'string',
  },
  flowVersionId: {
    key: 'flowVersionId',
    valueType: 'string',
  },
  call_duration_ms: {
    key: 'call_duration',
    valueType: 'number',
  },
  call_disposition: {
    key: 'call_disposition',
    valueType: 'string',
  },
  agent: {
    key: 'agent',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

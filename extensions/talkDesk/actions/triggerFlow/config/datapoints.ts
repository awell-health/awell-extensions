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
  call_start_time: {
    key: 'call_start_time',
    valueType: 'date',
  },
  call_end_time: {
    key: 'call_end_time',
    valueType: 'date',
  },
  call_duration_ms: {
    key: 'call_duration_ms',
    valueType: 'number',
  },
  call_status: {
    key: 'call_status',
    valueType: 'string',
  },
  disposition: {
    key: 'disposition',
    valueType: 'string',
  },
  agent: {
    key: 'agent',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

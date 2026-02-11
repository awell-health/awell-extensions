import { type DataPointDefinition } from '@awell-health/extensions-core'

export const consolidatedQueryDataPoints = {
  status: {
    key: 'status',
    valueType: 'string',
  },
  requestId: {
    key: 'requestId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const consolidatedQueryStatusDataPoints = {
  status: {
    key: 'status',
    valueType: 'string',
  },
  queries: {
    key: 'queries',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

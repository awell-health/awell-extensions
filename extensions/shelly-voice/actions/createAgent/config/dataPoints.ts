import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  agentId: {
    key: 'agentId',
    valueType: 'string',
  },
  config: {
    key: 'config',
    valueType: 'json',
  },
  createdAt: {
    key: 'createdAt',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

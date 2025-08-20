import { DataPointDefinition, DataPointValueType } from '@awell-health/extensions-core'

export const dataPoints = {
  agentId: {
    key: 'agentId',
    valueType: DataPointValueType.STRING,
  },
  config: {
    key: 'config',
    valueType: DataPointValueType.JSON,
  },
  createdAt: {
    key: 'createdAt',
    valueType: DataPointValueType.STRING,
  },
} satisfies Record<string, DataPointDefinition>

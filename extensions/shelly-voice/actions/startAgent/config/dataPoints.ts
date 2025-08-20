import { DataPointDefinition, DataPointValueType } from '@awell-health/extensions-core'

export const dataPoints = {
  sessionId: {
    key: 'sessionId',
    valueType: DataPointValueType.STRING,
  },
  status: {
    key: 'status',
    valueType: DataPointValueType.STRING,
  },
  startedAt: {
    key: 'startedAt',
    valueType: DataPointValueType.STRING,
  },
} satisfies Record<string, DataPointDefinition>

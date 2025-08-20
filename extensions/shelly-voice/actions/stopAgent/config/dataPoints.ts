import { DataPointDefinition, DataPointValueType } from '@awell-health/extensions-core'

export const dataPoints = {
  status: {
    key: 'status',
    valueType: DataPointValueType.STRING,
  },
  stoppedAt: {
    key: 'stoppedAt',
    valueType: DataPointValueType.STRING,
  },
} satisfies Record<string, DataPointDefinition>

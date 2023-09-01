import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  taskId: {
    key: 'taskId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

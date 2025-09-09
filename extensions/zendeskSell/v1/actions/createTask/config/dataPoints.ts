import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  taskId: {
    key: 'taskId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

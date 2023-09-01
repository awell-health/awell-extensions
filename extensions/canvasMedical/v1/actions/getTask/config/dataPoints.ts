import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  taskData: {
    key: 'taskData',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

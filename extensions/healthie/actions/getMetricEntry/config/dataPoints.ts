import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  metricId: {
    key: 'metricId',
    valueType: 'string',
  },
  metricValue: {
    key: 'metricValue',
    valueType: 'number',
  },
  createdAt: {
    key: 'createdAt',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>

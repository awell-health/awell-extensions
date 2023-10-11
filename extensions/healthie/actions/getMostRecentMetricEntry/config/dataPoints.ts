import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  lastMetricValue: {
    key: 'lastMetricValue',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

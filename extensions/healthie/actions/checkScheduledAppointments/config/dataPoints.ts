import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  isScheduled: {
    key: 'isScheduled',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

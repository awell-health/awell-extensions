import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  outcomeSummary: {
    key: 'outcomeSummary',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
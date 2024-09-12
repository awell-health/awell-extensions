import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  summary: {
    key: 'summary',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  observationId: {
    key: 'observationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

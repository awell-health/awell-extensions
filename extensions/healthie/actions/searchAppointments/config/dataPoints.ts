import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  results: {
    key: 'results',
    valueType: 'number',
  },
  appointmentId: {
    key: 'appointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  prompt: {
    // Comes in handy for debugging purposes - should be removed at some point
    key: 'prompt',
    valueType: 'string',
  },
  patientSummary: {
    key: 'patientSummary',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

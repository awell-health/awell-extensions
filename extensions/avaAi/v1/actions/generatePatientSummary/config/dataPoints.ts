import { type DataPointDefinition } from '../../../../../../lib/types'

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

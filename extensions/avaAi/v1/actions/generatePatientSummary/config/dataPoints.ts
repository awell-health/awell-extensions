import { type DataPointDefinition } from '../../../../../../lib/types'

export const dataPoints = {
  patientSummary: {
    key: 'patientSummary',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

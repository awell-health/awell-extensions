import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

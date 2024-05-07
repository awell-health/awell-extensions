import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  patientData: {
    key: 'patientData',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

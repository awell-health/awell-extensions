import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  patientAlreadyExists: {
    key: 'patientAlreadyExists',
    valueType: 'boolean',
  },
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

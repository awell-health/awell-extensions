import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  patientAlreadyExists: {
    key: 'patientAlreadyExists',
    valueType: 'boolean',
  },
  numberOfPatientsFound: {
    key: 'numberOfPatientsFound',
    valueType: 'number',
  },
  awellPatientIds: {
    key: 'awellPatientIds',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

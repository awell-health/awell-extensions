import { type DataPointDefinition } from '../../../../../../lib/types'

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

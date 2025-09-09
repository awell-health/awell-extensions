import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  patientData: {
    key: 'patientData',
    valueType: 'json',
  },
  patientFirstName: {
    key: 'patientFirstName',
    valueType: 'string',
  },
  patientLastName: {
    key: 'patientLastName',
    valueType: 'string',
  },
  patientDob: {
    key: 'patientDob',
    valueType: 'date',
  },
  patientGender: {
    key: 'patientGender',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

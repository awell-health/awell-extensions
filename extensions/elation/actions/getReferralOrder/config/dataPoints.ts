import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  letterId: {
    key: 'letterId',
    valueType: 'string',
  },
  patientId: {
    key: 'patientId',
    valueType: 'number',
  },
  consultantName: {
    key: 'consultantName',
    valueType: 'string',
  },
  practice: {
    key: 'practice',
    valueType: 'number',
  },
  diagnosisCodes: {
    key: 'diagnosisCodes',
    valueType: 'strings_array',
  },
  diagnosisLabels: {
    key: 'diagnosisLabels',
    valueType: 'strings_array',
  },
} satisfies Record<string, DataPointDefinition>

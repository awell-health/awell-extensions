import { FieldType, type Field } from '@awell-health/extensions-core'

export const removePatientFromCohortFields = {
  cohortId: {
    id: 'cohortId',
    label: 'Cohort ID',
    description: 'The ID of the cohort to remove the Patient from',
    type: FieldType.STRING,
    required: true,
  },
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The Metriport ID of the Patient to remove from the cohort',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the patient in Healthie you would like to retrieve.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

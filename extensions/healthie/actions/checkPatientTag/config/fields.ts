import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  id: {
    id: 'id',
    label: 'Tag ID',
    description: 'The ID of the tag in Healthie.',
    type: FieldType.STRING,
  },
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patient in Healthie.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

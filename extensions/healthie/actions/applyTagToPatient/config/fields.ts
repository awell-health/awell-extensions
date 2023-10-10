import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The ID of the tag to add to the patient.',
    type: FieldType.STRING,
    required: true,
  },
  patient_id: {
    id: 'patient_id',
    label: 'Patient ID',
    description: 'The ID of the patient to apply the tag on.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

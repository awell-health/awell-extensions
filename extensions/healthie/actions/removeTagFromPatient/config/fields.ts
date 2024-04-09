import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The ID of the tag to remove from the patient.',
    type: FieldType.STRING,
    required: true,
  },
  patient_id: {
    id: 'patient_id',
    label: 'Patient ID',
    description: 'The ID of the patient to remove the tag from.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

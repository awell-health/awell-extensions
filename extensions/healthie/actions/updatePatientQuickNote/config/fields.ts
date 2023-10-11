import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patient in Healthie to update the quick note for',
    type: FieldType.STRING,
    required: true,
  },
  quickNote: {
    id: 'quickNote',
    label: 'The quick note',
    description: 'Quick note',
    type: FieldType.HTML,
  },
  overwrite: {
    id: 'overwrite',
    label: 'Overwrite',
    description: 'Should it be overwritten?',
    type: FieldType.BOOLEAN,
  },
} satisfies Record<string, Field>

import { type Field, FieldType } from '@awell-health/extensions-core'
import { z } from 'zod'

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
    label: 'Quick note',
    description: '',
    type: FieldType.HTML,
  },
  overwrite: {
    id: 'overwrite',
    label: 'Overwrite quick note?',
    description: 'If true, the quick note will be replaced with the new content. If false, the content will be appended to the current content in the quick note.',
    type: FieldType.BOOLEAN,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  patientId: z.string().nonempty(),
  quickNote: z.string().nonempty(),
  overwrite: z.boolean(),
})

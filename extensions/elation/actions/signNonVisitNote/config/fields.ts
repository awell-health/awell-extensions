import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'

export const fields = {
  nonVisitNoteId: {
    id: 'nonVisitNoteId',
    label: 'Non-Visit Note ID',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
  signedBy: {
    id: 'signedBy',
    label: 'Signed by',
    description:
      'The ID of a physician or office staff who signs the note. Note: it has to be a physician ID, or an office staff ID, not a user ID.',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  nonVisitNoteId: NumericIdSchema,
  signedBy: NumericIdSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'

export const fields = {
  visitNoteId: {
    id: 'visitNoteId',
    label: 'Visit Note ID',
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
  visitNoteId: NumericIdSchema,
  signedBy: NumericIdSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

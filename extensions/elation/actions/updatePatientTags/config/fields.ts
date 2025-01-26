import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Elation patient ID',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
  instructions: {
    id: 'instructions',
    label: 'Specify tags to add, remove, or modify',
    type: FieldType.TEXT,
    required: true,
    description: 'Provide clear instructions for tag changes and relevant context, especially for uncommon tags. Specify new tags in single quotes (e.g., \'Patient-Tag\').'
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  instructions: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

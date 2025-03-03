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
    label: 'Instructions for checking tags',
    type: FieldType.TEXT,
    required: true,
    description: 'Provide clear instructions for checking presence of absence of tags. For example: "Check if the patient has the tag \'Eligible\'" or "Make sure the patient has tag \'A\' but does not have tag \'B\'"'
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  instructions: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>) 
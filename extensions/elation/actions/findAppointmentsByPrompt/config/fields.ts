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
  prompt: {
    id: 'prompt',
    label: 'Describe what appointments you would like to find',
    type: FieldType.TEXT,
    required: true,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  prompt: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

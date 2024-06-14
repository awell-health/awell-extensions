import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  minuend: {
    id: 'minuend',
    label: 'Minuend',
    description: '',
    required: true,
    type: FieldType.NUMERIC,
  },
  subtrahend: {
    id: 'subtrahend',
    label: 'Subtrahend',
    description: '',
    required: true,
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  minuend: z.number(),
  subtrahend: z.number(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

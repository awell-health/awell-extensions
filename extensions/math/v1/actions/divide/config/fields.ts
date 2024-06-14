import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  dividend: {
    id: 'dividend',
    label: 'Dividend',
    description: '',
    required: true,
    type: FieldType.NUMERIC,
  },
  divisor: {
    id: 'divisor',
    label: 'Divisor',
    description: '',
    required: true,
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  dividend: z.number(),
  divisor: z.number(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

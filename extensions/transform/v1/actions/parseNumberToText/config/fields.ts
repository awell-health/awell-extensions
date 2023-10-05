import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  number: {
    id: 'number',
    label: 'Number',
    description: 'The number you want to parse to a text (string).',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  number: z.union([z.number(), z.nan()]),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

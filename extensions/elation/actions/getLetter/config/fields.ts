import { z, type ZodTypeAny } from 'zod'
import { NumericIdSchema } from '@awell-health/extensions-core'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  letterId: {
    id: 'letterId',
    label: 'Letter ID',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  letterId: NumericIdSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

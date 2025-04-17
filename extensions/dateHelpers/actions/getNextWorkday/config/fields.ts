import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  referenceDate: {
    id: 'referenceDate',
    label: 'Reference date',
    description:
      'Set the reference date to calculate the next workday from. If not specified, the current date will be used.',
    type: FieldType.DATE,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  referenceDate: z.optional(z.coerce.date()),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

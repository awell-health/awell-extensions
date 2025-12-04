import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  referenceDate: {
    id: 'referenceDate',
    label: 'Reference date',
    description:
      'The date for which to calculate the next occurrence. If the year in the provided date is in the past, the next occurrence is computed in the upcoming year. If omitted, today’s date is used.',
    type: FieldType.DATE,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  referenceDate: z.optional(z.coerce.date()),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

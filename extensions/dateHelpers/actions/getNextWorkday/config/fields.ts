import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  referenceDate: {
    id: 'referenceDate',
    label: 'Reference date',
    description:
      'Set the reference date to calculate the next workday from. If not specified, the current date (today) will be used.',
    type: FieldType.DATE,
    required: false,
  },
  includeReferenceDate: {
    id: 'includeReferenceDate',
    label: 'Include reference date',
    description:
      'If this option is enabled and the reference date is a weekday (Monday to Friday), that date will be returned. If it is disabled, the next weekday after the reference date will be returned.',
    type: FieldType.BOOLEAN,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  referenceDate: z.optional(z.coerce.date()),
  includeReferenceDate: z.boolean().optional().default(true),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

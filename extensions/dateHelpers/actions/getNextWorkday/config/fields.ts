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
      'If this option is enabled and the reference date is a work day, that date will be returned. If it is disabled, the next work day after the reference date will be returned.',
    type: FieldType.BOOLEAN,
    required: false,
  },
  timezone: {
    id: 'timezone',
    label: 'Timezone',
    description:
      'The IANA timezone identifier to use for the next workday calculation (e.g., "America/New_York", "Europe/London", "America/Chicago", "UTC"). If not specified, America/Chicago will be used.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  referenceDate: z.optional(z.coerce.date()),
  includeReferenceDate: z.boolean().optional().default(true),
  timezone: z.string().optional().default('America/Chicago'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

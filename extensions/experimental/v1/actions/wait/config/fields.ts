import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  seconds: {
    id: 'seconds',
    label: 'Seconds',
    description:
      'Number of seconds to wait before this action will be completed',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  seconds: z.number(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  unixTimeStamp: {
    id: 'unixTimeStamp',
    label: 'Unix timestamp',
    description: 'The unix timestamp you want to parse to a date.',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  unixTimeStamp: z.number(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  DateTimeSchema,
  DateOnlySchema,
} from '@awell-health/extensions-core'

export const fields = {
  date: {
    id: 'date',
    label: 'Date',
    description: 'The date you want to parse to a unix timestamp.',
    type: FieldType.DATE,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  date: z.union([DateTimeSchema, DateOnlySchema]),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

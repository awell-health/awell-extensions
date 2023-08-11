import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  customerId: {
    label: 'Customer ID',
    id: 'customerId',
    type: FieldType.NUMERIC,
    required: true,
    description: "The customer's unique ID in Sendbird.",
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  customerId: z.coerce.number(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

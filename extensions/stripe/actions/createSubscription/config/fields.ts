import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  customer: {
    id: 'customer',
    label: 'Customer',
    description: 'The identifier of the customer to subscribe',
    type: FieldType.STRING,
    required: true,
  },
  item: {
    id: 'item',
    label: 'Item',
    description: 'The ID of the price object',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  customer: z.string().min(1),
  item: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

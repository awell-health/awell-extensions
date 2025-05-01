import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  mode: {
    id: 'mode',
    label: 'Mode',
    description:
      "The mode of the checkout session which can be 'payment', 'setup', and 'subscription'",
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: [
        {
          label: 'Payment',
          value: 'payment',
        },
        {
          label: 'Setup',
          value: 'setup',
        },
        {
          label: 'Subscription',
          value: 'subscription',
        },
      ],
    },
  },
  item: {
    id: 'item',
    label: 'Item',
    description: 'The id of the item (price ID) the customer is purchasing',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  mode: z.enum(['payment', 'setup', 'subscription']),
  item: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { CustomFieldsValidationSchema } from '../../../validation'

export const fields = {
  customerId: {
    label: 'Customer ID',
    id: 'customerId',
    type: FieldType.NUMERIC,
    required: true,
    description: "The customer's unique ID in Sendbird.",
  },
  customFields: {
    id: 'customFields',
    label: 'Custom fields',
    description:
      'A JSON object that can store up to twenty key-value items for additional customer information. The specified keys must be registered as a custom field in Sendbird.',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  customerId: z.coerce.number(),
  customFields: CustomFieldsValidationSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

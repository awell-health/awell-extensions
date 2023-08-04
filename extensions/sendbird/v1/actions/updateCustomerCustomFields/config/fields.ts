import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { CustomFieldsValidationSchema } from '../../../validation'

export const fields = {
  customerId: {
    label: 'Customer ID',
    id: 'customerId',
    type: FieldType.NUMERIC,
    required: true,
    description: "A customer's unique ID.",
  },
  customFields: {
    id: 'customFields',
    label: 'Custom fields',
    description:
      "Specifies a JSON object to store up to twenty key-value items for additional customer information such as a phone number, an email address, or a long description of the customer. The specified keys must be registered as a custom field in Settings > Customer fields of your dashboard beforehand. The key must not have a comma (,) and its length is limited to 20 characters. The value's length is limited to 190 characters.",
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  customerId: z.coerce.number(),
  customFields: CustomFieldsValidationSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

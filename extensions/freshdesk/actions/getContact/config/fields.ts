import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  contactId: {
    id: 'contactId',
    label: 'Contact ID',
    description:
      'The ID of the contact to get. This is commonly also referred to as the requester ID, particularly in the context of support tickets.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  contactId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

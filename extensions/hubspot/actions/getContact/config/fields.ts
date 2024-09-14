import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  contactId: {
    id: 'contactId',
    label: 'Contact ID',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  contactId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

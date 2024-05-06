import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  email: {
    id: 'email',
    label: 'Email',
    description:
      'Customer’s email address. It’s displayed alongside the customer in your dashboard and can be useful for searching and tracking.',
    type: FieldType.STRING,
    required: false,
  },
  name: {
    id: 'name',
    label: 'Name',
    description: 'The customer’s full name or business name.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

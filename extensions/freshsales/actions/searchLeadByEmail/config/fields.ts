import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  email: {
    id: 'email',
    label: 'Email',
    description: 'The email of the lead to search for',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  email: z.string().email().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

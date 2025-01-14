import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  userEmail: {
    id: 'userEmail',
    label: 'User Email',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userEmail: z.string().min(1).email(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

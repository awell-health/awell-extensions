import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  userId: {
    label: 'User ID',
    id: 'userId',
    type: FieldType.STRING,
    required: true,
    description: "A user's unique ID.",
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

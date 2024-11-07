import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description:
      'The ID of the form answer group to lock (prevents further editing)',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  id: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

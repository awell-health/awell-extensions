import { type Field, FieldType } from '../../../../../../lib/types'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  reason: {
    id: 'reason',
    label: 'Reason',
    description: 'The reason why you want to stop the care flow.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  reason: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

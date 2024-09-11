import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  goalId: {
    id: 'goalId',
    label: 'Goal ID',
    description: 'The ID of the goal to delete',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  goalId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

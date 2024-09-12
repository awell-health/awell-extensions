import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  prompt: {
    id: 'prompt',
    label: 'Prompt',
    description: 'Leave blank to use the default prompt',
    type: FieldType.TEXT,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  prompt: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

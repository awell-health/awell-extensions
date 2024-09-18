import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  additional_instructions: {
    id: 'additional_instructions',
    label: 'Additional Instructions',
    description: 'Specify additional instructions for summarization, for example format, length, what to focus on etc. If not specified, default instructions will be used.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  additional_instructions: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

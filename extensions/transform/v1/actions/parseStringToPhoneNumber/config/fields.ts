import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  text: {
    id: 'text',
    label: 'Text',
    description: 'The text you want to parse to a phone number',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  text: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

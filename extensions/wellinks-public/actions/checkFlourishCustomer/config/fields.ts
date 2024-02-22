import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  identifier: {
    id: 'identifier',
    label: 'Identifier',
    description: 'The identifier of the user to check Flourish for.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  identifier: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

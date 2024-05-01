import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  system: {
    id: 'system',
    label: 'System',
    description: 'The namespace for the identifier value',
    type: FieldType.STRING,
    required: true,
  },
  value: {
    id: 'value',
    label: 'Identifier value',
    description: 'The value of the identifier',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  system: z.string().min(1),
  value: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

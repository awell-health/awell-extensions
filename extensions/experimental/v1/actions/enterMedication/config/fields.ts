import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  label: {
    id: 'label',
    label: 'Label',
    type: FieldType.STRING,
    required: false,
    description: 'A label or description that will be shown above the question',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  label: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

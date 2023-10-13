import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  category: {
    id: 'category',
    label: 'Category',
    description: 'Specifies the metric you would like to retrieve',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  category: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

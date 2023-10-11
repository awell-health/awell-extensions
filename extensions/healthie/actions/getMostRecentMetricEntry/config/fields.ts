import { type Field, FieldType } from '@awell-health/extensions-core'
import { z } from 'zod'

export const fields = {
  category: {
    id: 'category',
    label: 'Category',
    description: 'Specifies what kind of metric we are storing',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  category: z.string().nonempty(),
})

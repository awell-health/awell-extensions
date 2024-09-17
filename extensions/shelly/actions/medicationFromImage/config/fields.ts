import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  imageUrl: {
    id: 'imageUrl',
    label: 'Image URL',
    description: 'The URL to the uploaded image',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  imageUrl: z.string().url(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

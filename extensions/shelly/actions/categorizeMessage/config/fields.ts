import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
export const fields = {
  message: {
    id: 'message',
    label: 'Message',
    description: 'The message to be categorized',
    type: FieldType.STRING, // Should be string, TEXT doesn't allow selecting a data point
    required: true,
  },
  categories: {
    id: 'categories',
    label: 'Categories',
    description: 'List of categories (comma-separated, no spaces)',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  categories: z
    .string()
    .trim()
    .min(1, 'At least one category is required')
    .transform((s) => s.split(',').map((item) => item.trim()))
    .refine((arr) => arr.length > 0, {
      message: 'At least one category is required',
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

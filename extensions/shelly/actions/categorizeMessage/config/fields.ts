import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  messageDataPoint: {
    id: 'messageDataPoint',
    label: 'Message Data Point',
    description:
      'The message to be categorized. Use this if you want to use a data point for the message.',
    type: FieldType.STRING, // Should be string, to allow selecting a data point
    required: false,
  },
  message: {
    id: 'message',
    label: 'Message',
    description:
      'The message to be categorized. Use this if you want to use a text for the message.',
    type: FieldType.TEXT, // TEXT if data point is not in use
    required: false,
  },
  categories: {
    id: 'categories',
    label: 'Categories',
    description: 'List of categories (comma-separated, no spaces)',
    type: FieldType.STRING,
    required: true,
  },
  instructions: {
    id: 'instructions',
    label: 'Instructions',
    description: 'Add additional instructions prompt for the LLM',
    type: FieldType.TEXT,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  message: z.string().optional(),
  messageDataPoint: z.string().optional(),
  categories: z
    .string()
    .trim()
    .min(1, 'At least one category is required')
    .transform((s) => s.split(',').map((item) => item.trim()))
    .refine((arr) => arr.length > 0, {
      message: 'At least one category is required',
    }),
  instructions: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

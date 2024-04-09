import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  deepLink: {
    id: 'deepLink',
    label: 'Deep link',
    description: 'Insert a deep link for testing',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  deepLink: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

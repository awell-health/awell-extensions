import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  urlTemplate: {
    id: 'urlTemplate',
    label: 'URL template',
    description:
      'The URL with the placeholder marked by double curly braces like (e.g. https://your-url.com/[placeholder]).',
    type: FieldType.STRING,
    required: true,
  },
  value: {
    id: 'value',
    label: 'Value',
    description:
      'The actual value to replace the placeholder with. Note that we will kebab case your value.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  urlTemplate: z
    .string()
    .url()
    .refine((input) => input.includes('[placeholder]'), {
      message: 'Your URL template does not include a [placeholder]',
    }),
  value: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  htmlString: {
    id: 'htmlString',
    label: 'HTML string',
    description: 'The HTML string to convert to a PDF.',
    type: FieldType.STRING,
    required: true,
  },
  options: {
    id: 'options',
    label: 'Options',
    description:
      'The options for the PDF. See https://pptr.dev/api/puppeteer.pdfoptions',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  htmlString: z.string().min(1),
  options: z.any().optional(),
})

import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  pageUrl: {
    id: 'pageUrl',
    label: 'Page URL',
    description: 'The URL of the page to scrape',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  pageUrl: z.string().min(1).url(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  subject: {
    id: 'subject',
    label: 'Onderwerp',
    type: FieldType.STRING,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Inhoud bericht',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  subject: z.string(),
  body: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  url: {
    id: 'url',
    label: 'URL',
    description:
      'The URL to encode as a QR code. Typically the session URL from a "Start Hosted Pages Session" step.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  url: z.string().url(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

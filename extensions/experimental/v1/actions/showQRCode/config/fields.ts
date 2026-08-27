import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const fields = {
  url: {
    id: 'url',
    label: 'URL',
    description:
      'The URL to encode as a QR code. Typically the session URL from a "Start Hosted Pages Session" step.',
    type: FieldType.STRING,
    required: true,
  },
  label: {
    id: 'label',
    label: 'Description',
    description: 'Enter the description to show above the QR code.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  url: z.url(),
  label: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodType>)

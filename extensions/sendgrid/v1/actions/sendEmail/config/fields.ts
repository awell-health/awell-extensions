import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'

export const fields = {
  to: {
    id: 'to',
    label: 'To',
    description: 'The email address of the recipient.',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
    required: true,
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    description: 'The subject of your email.',
    type: FieldType.STRING,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Body',
    description: 'The content of your message.',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { getEmailValidation } from '../../../../../../src/lib/awell'

export const fields = {
  fromName: {
    id: 'fromName',
    label: 'From name',
    description:
      'The name that will be used for the "From" header. When left blank, the value specified in the extension settings will be used.',
    type: FieldType.STRING,
    required: false,
  },
  fromEmail: {
    id: 'fromEmail',
    label: 'From email',
    description:
      'The email address that will be used for the "From" header. When left blank, the value specified in the extension settings will be used.',
    type: FieldType.STRING,
    required: false,
  },
  to: {
    id: 'to',
    label: 'To',
    description: 'The email address of the recipient.',
    type: FieldType.STRING,
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
  to: getEmailValidation(),
  subject: z.string(),
  body: z.string(),
  fromName: z.string().optional(),
  fromEmail: getEmailValidation().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

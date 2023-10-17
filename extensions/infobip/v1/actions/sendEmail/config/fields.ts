import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
} from '@awell-health/extensions-core'

export const fields = {
  from: {
    label: 'From',
    id: 'from',
    type: FieldType.STRING,
    required: false,
    description:
      'The email address you wish to use for sending emails. Defaults to value provided in settings.',
  },
  to: {
    label: 'To',
    id: 'to',
    type: FieldType.STRING,
    required: true,
    description: 'The email address to which you intend to send the email',
  },
  subject: {
    label: 'Subject',
    id: 'subject',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  content: {
    label: 'Content',
    id: 'content',
    type: FieldType.HTML,
    required: true,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  from: makeStringOptional(z.string()),
  to: z.string().email(),
  subject: z.string(),
  content: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

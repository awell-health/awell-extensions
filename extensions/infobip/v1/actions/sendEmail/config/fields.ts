import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
} from '@awell-health/extensions-core'

export const fields = {
  to: {
    label: 'To',
    id: 'to',
    type: FieldType.STRING,
    required: true,
    description: 'Email to which you want to send email messages to.',
  },
  subject: {
    label: 'Subject',
    id: 'subject',
    type: FieldType.STRING,
    required: true,
    description: 'Subject of an email.',
  },
  content: {
    label: 'Content',
    id: 'content',
    type: FieldType.HTML,
    required: true,
    description: 'Content of the email message.',
  },
  from: {
    label: 'From',
    id: 'from',
    type: FieldType.STRING,
    required: false,
    description:
      'Email from which you want to send email messages. Defaults to value provided in settings.',
  },
  replyTo: {
    label: 'Reply to',
    id: 'replyTo',
    type: FieldType.STRING,
    required: false,
    description:
      'Email address to which recipients of the email can reply. Defaults to value provided in settings.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  content: z.string(),
  from: makeStringOptional(z.string()),
  replyTo: makeStringOptional(z.string()),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

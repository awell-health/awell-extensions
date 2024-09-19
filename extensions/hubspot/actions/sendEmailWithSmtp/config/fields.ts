import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  from: {
    id: 'from',
    label: 'From',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  to: {
    id: 'to',
    label: 'To',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message',
    description: '',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  subject: z.string().min(1),
  message: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

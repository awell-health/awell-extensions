import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
  makeStringOptional,
} from '@awell-health/extensions-core'

export const fields = {
  from: {
    label: 'From',
    id: 'from',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
    description:
      'The phone number you wish to use for sending the text message. Defaults to value provided in settings.',
  },
  to: {
    label: 'To',
    id: 'to',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
    description:
      'The phone number to which you intend to send the text message',
  },
  text: {
    id: 'text',
    label: 'Content',
    type: FieldType.TEXT,
    required: true,
    description: 'The content of the message being sent',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  from: makeStringOptional(z.string()),
  to: z.string(),
  text: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

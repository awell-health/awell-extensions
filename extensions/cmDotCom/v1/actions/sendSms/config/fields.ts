import { z, type ZodTypeAny } from 'zod'
import { E164PhoneValidationSchema } from '@awell-health/extensions-core'
import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { FromNameValidationSchema } from '../../../validation'

export const fields = {
  fromName: {
    label: '"From" number',
    id: 'fromName',
    type: FieldType.STRING,
    required: false,
    description:
      'This is the sender\'s name. The maximum length is 11 alphanumerical characters or 16 digits. When left blank, the "From name" from the extension settings will be used. If "fromName" is defined on the action level, then that takes precedence over the value specified in the extension settings.',
  },
  recipient: {
    id: 'recipient',
    label: '"To" phone number',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    description: 'The phone number you would like to send the text message to.',
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message',
    description: 'The message you would like to send.',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  fromName: FromNameValidationSchema,
  recipient: E164PhoneValidationSchema,
  message: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

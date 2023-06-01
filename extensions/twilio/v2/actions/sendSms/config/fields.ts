import { z, type ZodTypeAny } from 'zod'
import {
  E164PhoneValidationSchema,
  E164PhoneValidationOptionalSchema,
} from '@awell-health/extensions-core'
import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { MessageValidationSchema } from '../../../../common/validation'

export const fields = {
  from: {
    label: '"From" number',
    id: 'from',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
    description:
      'The phone number that will send the text messages, it must be a Twilio phone number that you own. When left blank, the "From" number from the extension settings will be used.',
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
  recipient: E164PhoneValidationSchema,
  from: E164PhoneValidationOptionalSchema,
  message: MessageValidationSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

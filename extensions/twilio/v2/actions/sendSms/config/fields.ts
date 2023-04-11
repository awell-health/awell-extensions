import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType, StringType } from '../../../../../../lib/types'
import {
  MessageValidationSchema,
  PhoneValidationSchema,
} from '../../../../common/validation'

export const fields = {
  recipient: {
    id: 'recipient',
    label: '"To" phone number',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    description:
      'To what phone number would you like to send the text message?',
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  recipient: PhoneValidationSchema,
  message: MessageValidationSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

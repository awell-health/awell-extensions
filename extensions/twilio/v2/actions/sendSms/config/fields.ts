import { z, type ZodTypeAny } from 'zod'
import { E164PhoneValidationSchema } from '../../../../../../lib/shared/validation'
import { type Field, FieldType, StringType } from '@awell-health/awell-extensions-types'
import { MessageValidationSchema } from '../../../../common/validation'

export const fields = {
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
  message: MessageValidationSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

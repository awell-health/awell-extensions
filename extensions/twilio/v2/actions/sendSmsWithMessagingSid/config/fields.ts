import { z, type ZodTypeAny } from 'zod'
import { E164PhoneValidationSchema } from '@awell-health/extensions-core'
import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { MessageValidationSchema } from '../../../../common/validation'

export const fields = {
  messagingServiceSid: {
    label: 'Messaging Service SID',
    id: 'messagingServiceSid',
    type: FieldType.STRING,
    required: false,
    description:
      'The SID of the Messaging Service you want to associate with the Message. If left blank, the SID specified in the settings will be used.',
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
  messagingServiceSid: z.string().optional(),
  message: MessageValidationSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

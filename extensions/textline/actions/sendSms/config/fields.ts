import { z, type ZodTypeAny } from 'zod'
import { E164PhoneValidationSchema } from '@awell-health/extensions-core'
import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { MessageValidationSchema } from '../../../validation'

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
  departmentId: {
    id: 'departmentId',
    label: 'Department Id',
    description: 'The department from which you want to send the message. Defaults to to your first department.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  recipient: E164PhoneValidationSchema,
  message: MessageValidationSchema,
  departmentId: z.optional(z.string())
} satisfies Record<keyof typeof fields, ZodTypeAny>)

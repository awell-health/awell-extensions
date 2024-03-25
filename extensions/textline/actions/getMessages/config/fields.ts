import { z, type ZodTypeAny } from 'zod'
import { E164PhoneValidationOptionalSchema } from '@awell-health/extensions-core'
import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'

export const fields = {
  phoneNumber: {
    id: 'phoneNumber',
    label: 'Phone number to filter',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    description: 'Search for text messages received from this phone number',
    required: false,
  },
  afterMessageId: {
    id: 'afterMessageId',
    label: 'Messages after',
    type: FieldType.STRING,
    description:
      'The id of a message to use as non inclusive lower bound of post results.',
    required: false,
  },
  departmentId: {
    id: 'departmentId',
    label: 'Department Id',
    description: 'The ID of the department from which you want to retrieve the message. Defaults to to your first department.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  phoneNumber: E164PhoneValidationOptionalSchema,
  afterMessageId: z.optional(
    z
      .string()
      .min(10, { message: 'Message ID needs to be bigger than 10 characters.' })
  ),
  departmentId: z.optional(z.string())
} satisfies Record<keyof typeof fields, ZodTypeAny>)

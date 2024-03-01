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
    label: 'Phone number to filter',
    type: FieldType.STRING,
    description:
      'The id of a message to use as non inclusive lower bound of post results.',
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
} satisfies Record<keyof typeof fields, ZodTypeAny>)

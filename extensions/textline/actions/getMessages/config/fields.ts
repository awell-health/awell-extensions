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
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  phoneNumber: E164PhoneValidationOptionalSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

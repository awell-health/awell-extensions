import { z, type ZodTypeAny } from 'zod'
import { E164PhoneValidationSchema } from '@awell-health/extensions-core'
import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'

export const fields = {
  recipient: {
    id: 'recipient',
    label: '"To" phone number',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    description: 'The phone number you would like set the consent status.',
    required: true,
  },
  consentStatus: {
    id: 'consentStatus',
    label: 'Set customer consent',
    description: 'A true or false value to set the consent status of a contact.',
    type: FieldType.BOOLEAN,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  recipient: E164PhoneValidationSchema,
  consentStatus: z.boolean(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

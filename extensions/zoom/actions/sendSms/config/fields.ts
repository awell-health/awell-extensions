import {
  FieldType,
  StringType,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  contactCenterNumber: {
    id: 'contactCenterNumber',
    label: 'Contact center number',
    description:
      'This must be an SMS capable phone number allocated to Zoom Contact Center within your account.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  to: {
    id: 'to',
    label: 'To',
    description: 'The phone number of the person receiving the SMS.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Body',
    description:
      'The content that needs to be sent as an SMS. Maximum length is 500 characters.',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  contactCenterNumber: z.string().min(1),
  to: z.string().min(1),
  body: z.string().min(1).max(500),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

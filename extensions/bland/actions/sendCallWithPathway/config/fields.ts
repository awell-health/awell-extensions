import {
  FieldType,
  StringType,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  phoneNumber: {
    id: 'phoneNumber',
    label: 'Phone number',
    description: '',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  pathwayId: {
    id: 'pathwayId',
    label: 'Pathway ID',
    description:
      'Follows the conversational pathway you created to guide the conversation.',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  phoneNumber: z.string().min(1),
  pathwayId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

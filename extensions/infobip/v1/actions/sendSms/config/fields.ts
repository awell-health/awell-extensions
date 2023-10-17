import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
  makeStringOptional,
} from '@awell-health/extensions-core'

export const fields = {
  to: {
    label: 'To',
    id: 'to',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
    description: 'Phone number to which you want to send text messages to.',
  },
  text: {
    label: 'Text',
    id: 'text',
    type: FieldType.STRING,
    stringType: StringType.TEXT,
    required: true,
    description: 'Content of the text message.',
  },
  from: {
    label: 'From',
    id: 'from',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
    description:
      'Phone number from which you want to send text messages. Defaults to value provided in settings.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  from: makeStringOptional(z.string()),
  to: z.string(),
  text: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  text: {
    id: 'text',
    label: 'Text',
    description: 'The text you want to parse to a phone number',
    type: FieldType.STRING,
    required: true,
  },
  countryCallingCode: {
    id: 'countryCallingCode',
    label: 'Country calling code',
    description:
      'The country calling code you want to use for the phone number in case the phone number is not in E164 format. Enter the country calling code as a number.',
    type: FieldType.NUMERIC,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  text: z.string(),
  countryCallingCode: z.number().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

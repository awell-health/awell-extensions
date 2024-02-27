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
    description: 'Search for text messages sent from a specific phone number',
    required: false,
  },
  pageSize: {
    id: 'pageSize',
    label: 'Page Size',
    description:
      'The number of results per page. Minimum is 1 and maximum is 1000.',
    type: FieldType.NUMERIC,
    required: false,
  },
  page: {
    id: 'page',
    label: 'Page ',
    description: 'The current page',
    type: FieldType.NUMERIC,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  phoneNumber: E164PhoneValidationOptionalSchema,
  pageSize: z
    .number()
    .min(1, { message: 'Page size must be at least one' })
    .max(1000, { message: 'Cannot fetch more than 1000 messages' })
    .default(50),
  page: z
    .number()
    .min(1, { message: 'Page must be at least one' })
    .max(1000, { message: 'Cannot fetch more than 1000 pages' })
    .default(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

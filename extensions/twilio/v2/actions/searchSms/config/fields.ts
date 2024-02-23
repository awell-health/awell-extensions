import { z, type ZodTypeAny } from 'zod'
import {
  E164PhoneValidationOptionalSchema,
  DateOnlyOptionalSchema,
} from '@awell-health/extensions-core'
import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { isNil } from 'lodash'

export const fields = {
  from: {
    label: '"From" number',
    id: 'from',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
    description:
      'Search for text messages sent from a specific phone number'
  },
  recipient: {
    id: 'recipient',
    label: '"To" number',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    description: 'Search for text messages sent to a specific phone number',
    required: false,
  },
  page_size: {
    id: 'page_size',
    label: 'Page Size',
    description: 'The number of results per page. Minimum is 1 and maximum is 1000.',
    type: FieldType.NUMERIC,
    required: false,
  },
  date_sent_after: {
    id: 'date_sent_after',
    label: 'Sent date after than',
    description:
      'Search for messages sent after a given date',
    type: FieldType.DATE,
    required: false,
  },
  date_sent_before: {
    id: 'date_sent_before',
    label: 'Sent date before than',
    description: 'Search for messages sent before a given date',
    type: FieldType.DATE,
    required: false,
  },
  date_sent: {
    id: 'date_sent',
    label: 'Sent date',
    description: 'Search for messages sent on a given date',
    type: FieldType.DATE,
    required: false,
  },
} satisfies Record<string, Field>

const toDate = (arg: string | undefined): Date | undefined =>
  !isNil(arg) ? new Date(arg) : undefined

export const FieldsValidationSchema = z.object({
  recipient: E164PhoneValidationOptionalSchema,
  from: E164PhoneValidationOptionalSchema,
  page_size: z
    .number()
    .min(1, { message: 'Page size must be at least one' })
    .max(1000, { message: 'Cannot fetch more than 1000 messages' })
    .default(50),
  date_sent: DateOnlyOptionalSchema.transform(toDate),
  date_sent_after: DateOnlyOptionalSchema.transform(toDate),
  date_sent_before: DateOnlyOptionalSchema.transform(toDate),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

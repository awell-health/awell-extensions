import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
  DateTimeOptionalSchema,
  NumericIdSchema,
  DateTimeSchema,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'

const statusEnum = z.enum(['ACCEPTED', 'PENDING', 'CANCELLED', 'REJECTED'])

export const fields = {
  eventTypeId: {
    label: 'Event Type ID',
    id: 'eventTypeId',
    type: FieldType.NUMERIC,
    required: true,
    description: 'ID of the event type to book',
  },
  start: {
    label: 'Start',
    id: 'start',
    // STRING because it needs new DATE_TIME type
    type: FieldType.STRING,
    required: true,
    description:
      "Start time of the Event in ISO 8601 format, e.g. 2023-05-24T13:00:00.000Z. Please note that start/end time must be within user's availability hours.",
  },
  end: {
    label: 'End',
    id: 'end',
    // STRING because it needs new DATE_TIME type
    type: FieldType.STRING,
    required: false,
    description:
      "End time of the Event in ISO 8601 format, e.g. 2023-05-24T13:00:00.000Z. Please note that start/end time must be within user's availability hours.",
  },
  responses: {
    label: 'Responses',
    id: 'responses',
    type: FieldType.JSON,
    required: true,
    description: 'Object containing email, name, location',
  },
  metadata: {
    label: 'Metadata',
    id: 'metadata',
    type: FieldType.JSON,
    required: false,
    description: 'Any metadata associated with the booking',
  },
  timeZone: {
    label: 'Timezone',
    id: 'timeZone',
    type: FieldType.STRING,
    required: true,
    description: 'Timezone of the Attendee',
  },
  language: {
    label: 'Language',
    id: 'language',
    type: FieldType.STRING,
    required: true,
    description: 'Language of the Attendee',
  },
  title: {
    label: 'Title',
    id: 'title',
    type: FieldType.STRING,
    required: false,
    description: 'Title of Booking event',
  },
  recurringEventId: {
    label: 'Recurring Event Type ID',
    id: 'recurringEventId',
    type: FieldType.NUMERIC,
    required: false,
    description: 'Recurring event ID if the event is recurring',
  },
  description: {
    label: 'Description',
    id: 'description',
    type: FieldType.STRING,
    required: false,
    description: 'Description of the meeting',
  },
  status: {
    label: 'Status',
    id: 'status',
    type: FieldType.STRING,
    required: false,
    description:
      'Status of the meeting to be set. Possible values: "ACCEPTED", "PENDING", "CANCELLED", "REJECTED".',
    options: {
      dropdownOptions: Object.values(statusEnum.enum).map((status) => ({
        label: status,
        value: status,
      })),
    },
  },
} satisfies Record<string, Field>

export const JsonStringValidationSchema = z
  .string()
  .transform((str, ctx): object => {
    if (isNil(str) || isEmpty(str)) {
      return {}
    }

    try {
      const parsedJson = JSON.parse(str)

      if (isEmpty(parsedJson)) {
        return {}
      }

      if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        ctx.addIssue({
          code: 'custom',
          message: 'The value should represent an object',
        })
        return z.NEVER
      }

      return parsedJson
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  })

export const ResponsesValidationSchema = JsonStringValidationSchema.transform(
  (
    value,
    ctx
  ): {
    name: string
    email: string
    metadata: object
    location: string
  } => {
    if (isEmpty(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'The value should represent a correct object',
      })
      return z.NEVER
    }

    return value as {
      name: string
      email: string
      metadata: object
      location: string
    }
  }
)

export const FieldsValidationSchema = z.object({
  eventTypeId: NumericIdSchema,
  start: DateTimeSchema,
  end: DateTimeOptionalSchema,
  responses: ResponsesValidationSchema,
  metadata: makeStringOptional(JsonStringValidationSchema),
  timeZone: z.string(),
  language: z.string(),
  title: makeStringOptional(z.string()),
  recurringEventId: makeStringOptional(NumericIdSchema),
  description: makeStringOptional(z.string()),
  status: makeStringOptional(statusEnum),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

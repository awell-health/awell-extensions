import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
  DateTimeOptionalSchema,
} from '@awell-health/extensions-core'

export const fields = {
  bookingId: {
    label: 'Booking ID',
    id: 'bookingId',
    type: FieldType.STRING,
    required: true,
    description: 'The ID of a Booking in Cal.com',
  },
  title: {
    label: 'Title',
    id: 'title',
    type: FieldType.STRING,
    required: false,
    description: 'Title of Booking event',
  },
  description: {
    label: 'Description',
    id: 'description',
    type: FieldType.STRING,
    required: false,
    description: 'Description of the meeting',
  },
  start: {
    label: 'Start',
    id: 'start',
    // STRING because it needs new DATE_TIME type
    type: FieldType.STRING,
    required: false,
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
  status: {
    label: 'Status',
    id: 'status',
    type: FieldType.STRING,
    required: false,
    description:
      'Status of the meeting to be set. Possible values: "ACCEPTED", "PENDING", "CANCELLED", "REJECTED".',
  },
} satisfies Record<string, Field>

const statusEnum = z.enum(['ACCEPTED', 'PENDING', 'CANCELLED', 'REJECTED'])

export const FieldsValidationSchema = z.object({
  bookingId: z.string().nonempty(),
  title: makeStringOptional(z.string()),
  description: makeStringOptional(z.string()),
  status: makeStringOptional(statusEnum),
  start: DateTimeOptionalSchema,
  end: DateTimeOptionalSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)

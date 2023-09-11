import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
} from '@awell-health/extensions-core'

export const fields = {
  bookingId: {
    label: 'Booking ID',
    id: 'bookingId',
    type: FieldType.STRING,
    required: true,
    description: 'The ID of a Booking in Cal.com',
  },
  allRemainingBookings: {
    label: 'All remaining bookings',
    id: 'allRemainingBookings',
    type: FieldType.BOOLEAN,
    required: false,
    description: 'Delete all remaining bookings',
  },
  reason: {
    label: 'Reason',
    id: 'reason',
    type: FieldType.TEXT,
    required: false,
    description: 'The reason for cancellation of the booking',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  bookingId: z.string().nonempty(),
  allRemainingBookings: z.boolean().optional(),
  reason: makeStringOptional(z.string()),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

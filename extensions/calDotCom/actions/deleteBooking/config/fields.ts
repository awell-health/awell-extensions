import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  bookingId: {
    label: 'Booking ID',
    id: 'bookingId',
    type: FieldType.STRING,
    required: true,
    description: 'The ID of a Booking in Cal.com',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  bookingId: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

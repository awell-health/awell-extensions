import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  bookingId: {
    id: 'bookingId',
    label: 'Booking ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  bookingId: z.string().nonempty('Missing bookingId'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  bookingUid: {
    id: 'bookingUid',
    label: 'Booking UID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  bookingUid: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

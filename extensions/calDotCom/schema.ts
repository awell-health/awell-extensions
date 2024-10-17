import { z } from 'zod'

export const SettingsSchema = z.object({
  apiKey: z.string().nonempty('Missing API key'),
})

const UserSchema = z.object({
  email: z.string(),
  name: z.string(),
  timeZone: z.string(),
  locale: z.string().optional().nullable(),
})

export type User = z.infer<typeof UserSchema>

export const BookingSchema = z.object({
  eventTypeId: z.number(),
  title: z.string(),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.string(),
  uid: z.string(),
  id: z.coerce.number(),
  //   userId: z.number(),
  user: UserSchema,
  attendees: z.array(UserSchema),
  metadata: z.object({ videoCallUrl: z.string().optional() }),
  responses: z
    .object({
      email: z.string().optional(),
      name: z.string().optional(),
      location: z
        .object({
          optionValue: z.string().optional(),
          value: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
})

export const GetBookingResponseSchema = z.object({
  booking: BookingSchema,
})

export type Booking = z.infer<typeof BookingSchema>

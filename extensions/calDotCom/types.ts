import { z } from 'zod'

// const UserSchema = z.object({
//   email: z.string(),
//   name: z.string(),
//   timeZone: z.string(),
//   locale: z.string().optional().nullable(),
// })

// export type User = z.infer<typeof UserSchema>

export const BookingSchema = z.object({
  eventTypeId: z.number(),
  title: z.string(),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.string(),
  uid: z.string(),
  //   id: z.number(),
  //   userId: z.number(),
  //   user: UserSchema,
  //   attendees: z.array(UserSchema),
  //   metadata: z.record(z.unknown()),
})

export const GetBookingResponseSchema = z.object({
  booking: BookingSchema,
})

export type Booking = z.infer<typeof BookingSchema>

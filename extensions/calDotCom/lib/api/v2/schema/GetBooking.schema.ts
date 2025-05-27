import { z } from 'zod'
import { BaseResponseSchema } from './Response.schema'
import { BookingStatusSchema } from './atoms'

export const GetBookingInputSchema = z.object({
  bookingUid: z.string(),
})

export type GetBookingInputType = z.infer<typeof GetBookingInputSchema>

export const GetBookingResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    id: z.number(),
    uid: z.string(),
    title: z.string(),
    description: z.string(),
    hosts: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
        username: z.string(),
        timeZone: z.string(),
      }),
    ),
    status: BookingStatusSchema,
    cancellationReason: z.string().optional(),
    cancelledByEmail: z.string().optional(),
    reschedulingReason: z.string().optional(),
    rescheduledByEmail: z.string().optional(),
    rescheduledFromUid: z.string().optional(),
    start: z.string().datetime(),
    end: z.string().datetime(),
    duration: z.number(),
    eventType: z.object({
      id: z.number(),
      slug: z.string(),
    }),
    location: z.string(),
    absentHost: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    rating: z.number().optional(),
    icsUid: z.string().optional(),
    attendees: z.array(
      z.object({
        name: z.string(),
        email: z.string().optional(),
        timeZone: z.string(),
        phoneNumber: z.string().optional(),
        language: z.string().optional(),
      }),
    ),
    guests: z.array(z.string()),
    bookingFieldsResponses: z.record(z.string(), z.unknown()).optional(),
  }),
})

export type GetBookingResponseType = z.infer<typeof GetBookingResponseSchema>

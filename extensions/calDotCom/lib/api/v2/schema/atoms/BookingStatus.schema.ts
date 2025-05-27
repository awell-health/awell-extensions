import { z } from 'zod'

export const BookingStatusSchema = z.enum([
  'cancelled',
  'accepted',
  'rejected',
  'pending',
])

export type BookingStatusType = z.infer<typeof BookingStatusSchema>

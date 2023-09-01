import { bookingCreated } from './bookingCreated'
import { bookingCancelled } from './bookingCancelled'
import { bookingRescheduled } from './bookingRescheduled'
export type { BookingCreated } from './bookingCreated'
export type { BookingCancelled } from './bookingCancelled'
export type { BookingRescheduled } from './bookingRescheduled'

export const webhooks = [bookingCreated, bookingCancelled, bookingRescheduled]

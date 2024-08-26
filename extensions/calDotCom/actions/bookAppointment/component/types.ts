import { type ComponentProps } from 'react'
import { type CalDotComScheduling } from '@awell-health/ui-library'

export enum ActionKey {
  BOOK_APPOINTMENT = 'bookAppointment',
}

export interface BookAppointmentFields extends Record<string, any> {
  calLink: string
}

export type BookingSuccessfulFunction = ComponentProps<
  typeof CalDotComScheduling
>['onBookingSuccessful']

export type BookingSuccessfulFunctionArg =
  Parameters<BookingSuccessfulFunction>[0]

import { type z } from 'zod'
import {
  type statusSchema,
  type appointmentSchema,
  type FindAppointmentFieldSchema,
} from '../validation/appointment.zod'

export type AppointmentInput = z.infer<typeof appointmentSchema>
export type FindAppointmentFields = z.input<typeof FindAppointmentFieldSchema>
/**
 * There is a difference between `input` and `output` objects in Elation,
 * some fields are readonly (not in input), some have different structure.
 * `service_location` is omitted and re-declared due to type difference
 */
export interface AppointmentResponse
  extends Omit<AppointmentInput, 'service_location'> {
  id: number
  time_slot_type: string
  time_slot_status: string
  status: AnyStatus
  service_location?: ServiceLocation
  recurring_event_schedule: unknown // ? cannot find in docs
  billing?: BillingDetails
  payment?: Payment
  created_date: string
  last_modified_date: string
  deleted_date?: string | null
}

interface Status extends z.infer<typeof statusSchema> {
  status_date: string
}

interface NotSeenStatus extends Status {
  status_detail: string
}

type AnyStatus = Status | NotSeenStatus

interface ServiceLocation {
  id: number
  name: string
  place_of_service: number
  address_line1: string
  address_line2: string
  city: string
  state: string
  zip: string
  phone: string
}

interface BillingDetails {
  billing_note: string
  referring_provider: string
  referring_provider_state: string
}

interface Payment {
  id: string
  amount: string
  when_collected: string
  bill?: number
  appointment: number
  create_date: string
  delete_date?: string | null
}

export interface FindAppointmentsParams {
  patient: number
  physician?: number
  practice?: number
  from_date?: string
  to_date?: string
  time_slot_type?: 'appointment'
}

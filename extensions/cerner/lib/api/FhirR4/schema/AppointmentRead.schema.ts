import { z } from 'zod'
import { type Appointment } from '@medplum/fhirtypes'

export const AppointmentReadInputSchema = z.string()

export type AppointmentReadInputType = z.infer<
  typeof AppointmentReadInputSchema
>

/**
 * This is probably imperfect as Medplum's FHIR type might
 * not be fully compatible with Epic's FHIR type but good enough for now
 */
export type AppointmentReadResponseType = Appointment

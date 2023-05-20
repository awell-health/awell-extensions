import { appointmentCreated } from './appointmentCreated'
import { patientCreated } from './patientCreated'
export type { AppointmentCreated } from './appointmentCreated'
export type { PatientCreated } from './patientCreated'

export const webhooks = [appointmentCreated, patientCreated]

import { patientCreatedOrUpdated } from './patientCreatedOrUpdated'
import { appointmentCreatedOrUpdated } from './appointmentCreatedOrUpdated'

export const webhooks = [patientCreatedOrUpdated, appointmentCreatedOrUpdated]

import { patientCreatedOrUpdated } from './patientCreatedOrUpdated'
export type { OnCreatePatient } from './patientCreatedOrUpdated'

export const webhooks = [patientCreatedOrUpdated]

import { patientAdmitted } from './patientAdmitted'
import { patientDischarged } from './patientDischarged'
export type { PatientAdmitted } from './patientAdmitted'
export type { PatientDischarged } from './patientDischarged'

export const webhooks = [patientAdmitted, patientDischarged]

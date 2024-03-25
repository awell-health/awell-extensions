import { getPatient } from './getPatient'
import { getAppointment } from './getAppointment'
import { createPatient } from './createPatient'
import { createAppointmentNote } from './createAppointmentNote'
// import { addProblemToPatientChart } from './addProblemToPatientChart'
// import { addDocumentToPatientChart } from './addDocumentToPatientChart'

const actions = {
  getPatient,
  getAppointment,
  createPatient,
  createAppointmentNote,
  // addProblemToPatientChart,
  // addDocumentToPatientChart,
}

export default actions

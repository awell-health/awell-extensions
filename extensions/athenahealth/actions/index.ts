import { getPatient } from './getPatient'
import { getAppointment } from './getAppointment'
import { cancelAppointment } from './cancelAppointment'
import { addProblemToPatientChart } from './addProblemToPatientChart'
import { addDocumentToPatientChart } from './addDocumentToPatientChart'

const actions = {
  getPatient,
  getAppointment,
  cancelAppointment,
  addProblemToPatientChart,
  addDocumentToPatientChart,
}

export default actions

import { getPatient } from './getPatient'
import { getAppointment } from './getAppointment'
import { createPatient } from './createPatient'
import { createAppointmentNote } from './createAppointmentNote'
import { addClinicalDocument } from './addClinicalDocument'

const actions = {
  getPatient,
  getAppointment,
  createPatient,
  createAppointmentNote,
  addClinicalDocument,
}

export default actions

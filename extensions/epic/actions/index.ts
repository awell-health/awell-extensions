import { createPatient } from './createPatient'
import { getPatient } from './getPatient'
import { getAppointment } from './getAppointment'
import { createClinicalNote } from './createClinicalNote'

const actions = {
  getPatient,
  getAppointment,
  createPatient,
  createClinicalNote,
}

export default actions

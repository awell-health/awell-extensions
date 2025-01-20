import { createPatient } from './createPatient'
import { getPatient } from './getPatient'
import { getAppointment } from './getAppointment'
import { createClinicalNote } from './createClinicalNote'
import { matchPatient } from './matchPatient'

const actions = {
  getPatient,
  getAppointment,
  createPatient,
  createClinicalNote,
  matchPatient,
}

export default actions

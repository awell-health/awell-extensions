import { createPatient } from './createPatient'
import { getPatient } from './getPatient'
import { getAppointment } from './getAppointment'
import { createClinicalNote } from './createClinicalNote'
import { matchPatient } from './matchPatient'
import { findPatientByMRN } from './findPatientByMRN'
const actions = {
  getPatient,
  getAppointment,
  createPatient,
  createClinicalNote,
  matchPatient,
  findPatientByMRN,
}

export default actions

import { createPatient } from './createPatient'
import { getPatient } from './getPatient'
import { getAppointment } from './getAppointment'
import { createClinicalNote } from './createClinicalNote'
import { matchPatient } from './matchPatient'
import { findPatientByMRN } from './findPatientByMRN'
import { getClinicalNote } from './getClinicalNote'

const actions = {
  getPatient,
  getAppointment,
  createPatient,
  createClinicalNote,
  matchPatient,
  findPatientByMRN,
  getClinicalNote,
}

export default actions

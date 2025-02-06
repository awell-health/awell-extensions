import { getPatient } from './getPatient'
import { createPatient } from './createPatient'
import { findPatientByMRN } from './findPatientByMRN'
import { getAppointment } from './getAppointment'
import { createDocument } from './createDocument'
import { getPatientEncounters } from './getPatientEncounters'
import { getEncounter } from './getEncounter'

const actions = {
  getPatient,
  createPatient,
  findPatientByMRN,
  getAppointment,
  createDocument,
  getPatientEncounters,
  getEncounter,
}

export default actions

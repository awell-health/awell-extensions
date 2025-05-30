import { getPatient } from './getPatient/getPatient'
import { updatePatient } from './updatePatient'
import { createPatient } from './createPatient'
import { createAppointment } from './createAppointment'
import { getAppointment } from './getAppointment'
import { getPharmacy } from './getPharmacy'
import { findAppointments } from './findAppointments'
import { findPhysician } from './findPhysician'
import { createNonVisitNote } from './createNonVisitNote'
import { updateNonVisitNote } from './updateNonVisitNote'
import { getNonVisitNote } from './getNonVisitNote'
import { deleteNonVisitNote } from './deleteNonVisitNote'
import { getPhysician } from './getPhysician'
import { postLetter } from './postLetter'
import { createLabOrder } from './createLabOrder'
import { createMessageThread } from './createMessageThread'
import { addMessageToThread } from './addMessageToThread'
import { addHistory } from './addHistory/addHistory'
import { addAllergy } from './addAllergy/addAllergy'
import { createVisitNote } from './createVisitNote/createVisitNote'
import { addVitals } from './addVitals/addVitals'
import { getLetter } from './getLetter'
import { createReferralOrder } from './createReferralOrder'
import { createCareGap } from './createCareGap'
import { closeCareGap } from './closeCareGap'
import { updatePatientTags } from './updatePatientTags'
import { checkPatientTags } from './checkPatientTags'
import { getReferralOrder } from './getReferralOrder'
import { findFutureAppointment } from './findFutureAppointment'
import { findAppointmentsWithAI } from './findAppointmentsWithAI'
import { signNonVisitNote } from './signNonVisitNote/signNonVisitNote'
import { updateReferralOrderResolution } from './updateReferralOrderResolution'
import { cancelAppointments } from './cancelAppointments/cancelAppointments'

export const actions = {
  getPatient,
  createPatient,
  updatePatient,
  createAppointment,
  getAppointment,
  findAppointments,
  getPharmacy,
  getPhysician,
  findPhysician,
  createNonVisitNote,
  updateNonVisitNote,
  getNonVisitNote,
  deleteNonVisitNote,
  createVisitNote,
  addVitals,
  addHistory,
  addAllergy,
  postLetter,
  createLabOrder,
  createMessageThread,
  addMessageToThread,
  getLetter,
  createReferralOrder,
  createCareGap,
  closeCareGap,
  updatePatientTags,
  checkPatientTags,
  getReferralOrder,
  findFutureAppointment,
  findAppointmentsWithAI,
  signNonVisitNote,
  updateReferralOrderResolution,
  cancelAppointments,
}

import { getPatient } from './getPatient'
import { updatePatient } from './updatePatient'
import { createPatient } from './createPatient'
import { createAppointment } from './createAppointment'
import { getAppointment } from './getAppointment'
import { findPhysician } from './findPhysician'
import { createNonVisitNote } from './createNonVisitNote'
// import { updateNonVisitNote } from './updateNonVisitNote'
import { getNonVisitNote } from './getNonVisitNote'
import { deleteNonVisitNote } from './deleteNonVisitNote'
import { getPhysician } from './getPhysician'
import { postLetter } from './postLetter'

export const actions = {
  getPatient,
  createPatient,
  updatePatient,
  createAppointment,
  getAppointment,
  getPhysician,
  findPhysician,
  createNonVisitNote,
  // updateNonVisitNote, // Disable for now, don't immediately see a use case for this action.
  getNonVisitNote,
  deleteNonVisitNote,
  postLetter,
}

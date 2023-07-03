import { getPatient } from './getPatient'
import { updatePatient } from './updatePatient'
import { createPatient } from './createPatient'
import { createAppointment } from './createAppointment'
import { getAppointment } from './getAppointment'
import { findPhysician } from './findPhysician'
import { createNonVisitNote } from './createNonVisitNote'
import { updateNonVisitNote } from './updateNonVisitNote'
import { getNonVisitNote } from './getNonVisitNote'
import { deleteNonVisitNote } from './deleteNonVisitNote'

export const actions = {
  getPatient,
  createPatient,
  updatePatient,
  createAppointment,
  getAppointment,
  findPhysician,
  createNonVisitNote,
  updateNonVisitNote,
  getNonVisitNote,
  deleteNonVisitNote,
}

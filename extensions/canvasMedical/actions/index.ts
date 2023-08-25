import { updatePatient } from './updatePatient'
import { createPatient } from './createPatient'
import { updateAppointment } from './updateAppointment'
import { createAppointment } from './createAppointment'
import { updateTask } from './updateTask'
import { createTask } from './createTask'
import { extractPatientInfo } from './extractPatientFields'

export const actions = {
  updatePatient,
  createPatient,
  updateAppointment,
  createAppointment,
  updateTask,
  createTask,
  extractPatientInfo,
}

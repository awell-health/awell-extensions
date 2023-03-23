import { createAppointment } from './createAppointment'
import { createTask } from './createTask'
import { getAppointment } from './getAppointment'
import { getPatient } from './getPatient'
import { sendChatMessage } from './sendChatMessage'
import { createPatient } from './createPatient'
import { updatePatient } from './updatePatient'
import { applyTagToPatient } from './applyTagToPatient'
import { removeTagFromPatient } from './removeTagFromPatient'
import { createChartingNote } from './createChartingNote'

export const actions = {
  createAppointment,
  createTask,
  getAppointment,
  getPatient,
  sendChatMessage,
  createPatient,
  updatePatient,
  applyTagToPatient,
  removeTagFromPatient,
  createChartingNote
}

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
import { sendFormCompletionRequest } from './sendFormCompletionRequest'
import { archivePatient } from './archivePatient'
import { createLocation } from './createLocation'
import { closeChatConversation } from './closeChatConversation'
import { deleteAppointment } from './deleteAppointment'
import { cancelAppointment } from './cancelAppointment'
import { createJournalEntry } from './createJournalEntry'

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
  createChartingNote,
  sendFormCompletionRequest,
  archivePatient,
  createLocation,
  closeChatConversation,
  deleteAppointment,
  cancelAppointment,
  createJournalEntry,
}

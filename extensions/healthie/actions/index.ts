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
// import { createLocation } from './createLocation'
import { closeChatConversation } from './closeChatConversation'
import { deleteAppointment } from './deleteAppointment'
import { cancelAppointment } from './cancelAppointment'
import { deleteTask } from './deleteTask'
import { completeTask } from './completeTask'
import { assignPatientToGroup } from './assignPatientToGroup'

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
  /**
   * There is bug in Healthie that prevents linking an address with a patient
   * Waiting for fix
   **/
  // createLocation,
  closeChatConversation,
  deleteAppointment,
  cancelAppointment,
  /**
   *  Specs of this API endpoint are unclear so we are not sure what
   *  functional value it delivers in the current state. Needs to be revisited.
   **/
  // createJournalEntry,
  deleteTask,
  completeTask,
  assignPatientToGroup,
}

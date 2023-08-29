import { updatePatient } from './updatePatient'
import { createPatient } from './createPatient'
import { updateAppointment } from './updateAppointment'
import { createAppointment } from './createAppointment'
import { createTask } from './createTask'
import { extractPatientInfo } from './extractPatientFields'
import { createQuestionnaireResponses } from './createQuestionnaireResponses'
import { getQuestionnaireResponse } from './getQuestionnaireResponse'

export const actions = {
  updatePatient,
  createPatient,
  updateAppointment,
  createAppointment,
  createTask,
  extractPatientInfo,
  createQuestionnaireResponses,
  getQuestionnaireResponse,
}

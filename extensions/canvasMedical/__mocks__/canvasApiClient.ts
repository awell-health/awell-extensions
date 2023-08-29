import { samplePatientId, samplePatientResource } from './patient'
import { sampleTaskId, sampleTaskResource } from './task'
import { sampleAppointmentId, sampleAppointmentResource } from './appointment'
import {
  sampleCreateQuestionnaireResponsesResource,
  sampleQuestionnaireResponseResource,
} from './questionnaireResponses'

export const mockMakeAPIClient = (): any => {
  return {
    createPatient: jest.fn(async () => samplePatientId),
    updatePatient: jest.fn(async () => samplePatientId),
    getPatient: jest.fn(async () => samplePatientResource),
    createTask: jest.fn(async () => sampleTaskId),
    getTask: jest.fn(async () => sampleTaskResource),
    updateTask: jest.fn(async () => sampleTaskId),
    createAppointment: jest.fn(async () => sampleAppointmentId),
    updateAppointment: jest.fn(async () => sampleAppointmentId),
    getAppointment: jest.fn(async () => sampleAppointmentResource),
    createQuestionnaireResponses: jest.fn(
      async () => sampleCreateQuestionnaireResponsesResource
    ),
    getQuestionnaireResponse: jest.fn(
      async () => sampleQuestionnaireResponseResource
    ),
  }
}

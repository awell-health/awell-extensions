import {
  mockedAppointmentId,
  mockedAppointmentResource,
  mockedPatientId,
  mockedTaskId,
  mockedTaskResource,
  mockedPatientResource,
  mockedCreateQuestionnaireResponsesResource,
  mockedQuestionnaireResponseResource,
  mockedCoverageId,
  mockedClaimId,
} from './testData'

export const mockedMakeAPIClient = (): any => {
  return {
    createAppointment: jest.fn(async () => mockedAppointmentId),
    getAppointment: jest.fn(async () => mockedAppointmentResource),
    updateAppointment: jest.fn(async () => mockedAppointmentId),
    createTask: jest.fn(async () => mockedTaskId),
    getTask: jest.fn(async () => mockedTaskResource),
    updateTask: jest.fn(async () => mockedTaskId),
    createPatient: jest.fn(async () => mockedPatientId),
    getPatient: jest.fn(async () => mockedPatientResource),
    updatePatient: jest.fn(async () => mockedPatientId),
    createQuestionnaireResponses: jest.fn(
      async () => mockedCreateQuestionnaireResponsesResource
    ),
    getQuestionnaireResponse: jest.fn(
      async () => mockedQuestionnaireResponseResource
    ),
    createCoverage: jest.fn(async () => mockedCoverageId),
    updateCoverage: jest.fn(async () => mockedCoverageId),
    createClaim: jest.fn(async () => mockedClaimId),
  }
}

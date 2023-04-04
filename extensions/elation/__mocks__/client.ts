import { appointmentExample, patientExample } from './constants'

const ElationAPIClientMock = jest.fn().mockImplementation((params) => {
  return {
    getPatient: jest.fn((params) => {
      return { id: 1, ...patientExample, mobile_phone: 'undefined' }
    }),
    createPatient: jest.fn((params) => {
      return { id: 1, ...patientExample }
    }),
    updatePatient: jest.fn((params) => {
      return { id: 1, ...patientExample }
    }),
    createAppointment: jest.fn((params) => {
      return { id: 1, ...appointmentExample }
    }),
    getAppointment: jest.fn((params) => {
      return { id: 1, ...appointmentExample }
    }),
  }
})

export { ElationAPIClientMock as ElationAPIClient }

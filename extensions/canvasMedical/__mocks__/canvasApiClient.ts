import { patientResource as mockPatientResource } from './patient'
import { taskResource as mockTaskResource } from './task'
import { appointmentResource as mockAppointmentResource } from './appointment'

export const mockMakeAPIClient = (): any => {
  return {
    createPatient: jest.fn(async () => mockPatientResource),
    updatePatient: jest.fn(async () => mockPatientResource),
    getPatient: jest.fn(async () => mockPatientResource),
    createTask: jest.fn(async () => mockTaskResource),
    getTask: jest.fn(async () => mockTaskResource),
    updateTask: jest.fn(async () => mockTaskResource),
    createAppointment: jest.fn(async () => mockAppointmentResource),
    updateAppointment: jest.fn(async () => mockAppointmentResource),
    getAppointment: jest.fn(async () => mockAppointmentResource),
  }
}

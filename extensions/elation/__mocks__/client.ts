import { type ElationCollection } from '../types/generic'
import { type PhysicianResponse } from '../types/physician'
import {
  appointmentExample,
  patientExample,
  physicianResponseExample,
} from './constants'
const { makeAPIClient: makeAPIClientActual } = jest.requireActual('../client')

export const mockClientReturn = {
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
    return {
      id: 1,
      ...appointmentExample,
      service_location: {
        id: appointmentExample.service_location,
      },
    }
  }),
  getAppointment: jest.fn((params) => {
    return {
      id: 1,
      ...appointmentExample,
      service_location: {
        id: appointmentExample.service_location,
      },
    }
  }),
  findPhysicians: jest.fn((): ElationCollection<PhysicianResponse> => {
    return {
      count: 1,
      next: null,
      previous: null,
      results: [physicianResponseExample],
    }
  }),
}
const ElationAPIClientMock = jest.fn((params) => {
  return mockClientReturn
})

export const makeAPIClientMockFunc = (args: any): any => {
  makeAPIClientActual(args)

  return new ElationAPIClientMock(args)
}
const makeAPIClientMock = jest.fn(makeAPIClientMockFunc)

export {
  ElationAPIClientMock as ElationAPIClient,
  makeAPIClientMock as makeAPIClient,
}

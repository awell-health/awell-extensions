import { assert } from 'console'
import { isNil } from 'lodash'
import { type ElationCollection } from '../types/generic'
import { type NonVisitNoteResponse } from '../types/nonVisitNote'
import { type PhysicianResponse } from '../types/physician'
import {
  allergyExample,
  appointmentExample,
  findContactResponseExample,
  historyResponseExample,
  labOrderResponseExample,
  nonVisitNoteResponseExample,
  patientExample,
  physicianResponseExample,
  postLetterResponseExample,
  vitalsResponseExample,
  visitNoteExample,
  getLetterResponseExample,
  referralOrderExample,
  mockFindAppointmentsResponse,
} from './constants'
const { makeAPIClient: makeAPIClientActual } = jest.requireActual('../client')

export const mockClientReturn = {
  getPatient: jest.fn((params) => {
    return { id: 1, ...patientExample }
  }),
  getLetter: jest.fn((params) => {
    return getLetterResponseExample
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
  findAppointments: jest.fn((params) => {
    if (params.patient === 12345) {
      return mockFindAppointmentsResponse
    } else {
      return []
    }
  }),
  getPhysician: jest.fn((params) => {
    return physicianResponseExample
  }),
  findPhysicians: jest.fn((): ElationCollection<PhysicianResponse> => {
    return {
      count: 1,
      next: null,
      previous: null,
      results: [physicianResponseExample],
    }
  }),
  createNonVisitNote: jest.fn((): NonVisitNoteResponse => {
    return nonVisitNoteResponseExample
  }),
  getNonVisitNote: jest.fn((): NonVisitNoteResponse => {
    return nonVisitNoteResponseExample
  }),
  updateNonVisitNote: jest.fn((noteId, note): NonVisitNoteResponse => {
    if (!isNil(note.signed_by)) {
      assert(!isNil(note.sign_date))
    }
    return nonVisitNoteResponseExample
  }),
  deleteNonVisitNote: jest.fn(() => {
    return {}
  }),
  postNewLetter: jest.fn(() => {
    return postLetterResponseExample
  }),
  createLabOrder: jest.fn(() => {
    return labOrderResponseExample
  }),
  searchContactsByNpi: jest.fn(() => {
    return findContactResponseExample
  }),
  addAllergy: jest.fn((params) => {
    return {
      id: 1,
      ...allergyExample,
    }
  }),
  addHistory: jest.fn(() => {
    return historyResponseExample
  }),
  createVisitNote: jest.fn((params) => {
    return {
      id: 1,
      ...visitNoteExample,
    }
  }),
  addVitals: jest.fn((params) => {
    return {
      ...vitalsResponseExample,
    }
  }),
  createReferralOrder: jest.fn(() => {
    return referralOrderExample
  }),
}
const ElationAPIClientMock = jest.fn((params) => {
  return mockClientReturn
})

export const makeAPIClientMockFunc = (args: any) => {
  makeAPIClientActual(args)

  return new ElationAPIClientMock(args)
}
const makeAPIClientMock = jest.fn(makeAPIClientMockFunc)

export {
  ElationAPIClientMock as ElationAPIClient,
  makeAPIClientMock as makeAPIClient,
}

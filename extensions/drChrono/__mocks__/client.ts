import { patientExample } from './constants'
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

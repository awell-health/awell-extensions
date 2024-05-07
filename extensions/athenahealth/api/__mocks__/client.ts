/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/promise-function-async */
import {
  AxiosError,
  type AxiosResponseHeaders,
  type RawAxiosRequestHeaders,
} from 'axios'
import { mockGetAppointmentResponse, mockGetPatientResponse } from './mockData'

const createAxiosError = (
  statusCode: number,
  headers: RawAxiosRequestHeaders | AxiosResponseHeaders,
  data: string
) => {
  const response = {
    data: JSON.parse(data),
    status: statusCode,
    headers,
  }

  return new AxiosError(
    'Some error message',
    undefined,
    undefined,
    undefined,
    // @ts-expect-error this is fine for the mock
    response
  )
}
export class AthenaAPIClient {
  createPatient = jest.fn(({ practiceId }: { practiceId: string }) => {
    return {
      patientid: '1',
    }
  })

  getPatient = jest.fn(
    ({ practiceId, patientId }: { practiceId: string; patientId: string }) => {
      if (patientId === '99999999999')
        return Promise.reject(
          createAxiosError(
            404,
            { 'Content-Type': 'text/html; charset=iso-8859-1' },
            JSON.stringify({
              error: 'This patient does not exist in this context.',
            })
          )
        )

      if (practiceId === '99999999999') {
        return Promise.reject(
          createAxiosError(
            404,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              error: 'Invalid practice.',
              detailedmessage: 'The practice ID does not exist.',
            })
          )
        )
      }

      return mockGetPatientResponse
    }
  )

  getAppointment = jest.fn(
    ({
      practiceId,
      appointmentId,
    }: {
      practiceId: string
      appointmentId: string
    }) => {
      if (appointmentId === '99999999999')
        return Promise.reject(
          createAxiosError(
            404,
            { 'Content-Type': 'text/html; charset=iso-8859-1' },
            JSON.stringify({ error: 'The appointment is not available.' })
          )
        )

      if (practiceId === '99999999999') {
        return Promise.reject(
          createAxiosError(
            404,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              error: 'Invalid practice.',
              detailedmessage: 'The practice ID does not exist.',
            })
          )
        )
      }

      return mockGetAppointmentResponse
    }
  )

  createAppointmentNote = jest.fn(
    ({
      practiceId,
      appointmentId,
    }: {
      practiceId: string
      appointmentId: string
    }) => {
      if (appointmentId === '99999999999')
        return Promise.reject(
          createAxiosError(
            404,
            { 'Content-Type': 'text/html; charset=iso-8859-1' },
            JSON.stringify({ error: 'The appointment is not available.' })
          )
        )

      if (practiceId === '99999999999') {
        return Promise.reject(
          createAxiosError(
            404,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              error: 'Invalid practice.',
              detailedmessage: 'The practice ID does not exist.',
            })
          )
        )
      }

      return {
        success: 'true',
      }
    }
  )

  addClinicalDocumentToPatientChart = jest.fn(
    ({ practiceId, patientId }: { practiceId: string; patientId: string }) => {
      if (patientId === '99999999999')
        return Promise.reject(
          createAxiosError(
            400,
            { 'Content-Type': 'text/html; charset=iso-8859-1' },
            JSON.stringify({
              detailedmessage:
                'The specified patient does not exist in that department.',
              error: 'The specified patient does not exist in that department.',
            })
          )
        )

      if (practiceId === '99999999999') {
        return Promise.reject(
          createAxiosError(
            404,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              error: 'Invalid practice.',
              detailedmessage: 'The practice ID does not exist.',
            })
          )
        )
      }

      return {
        clinicaldocumentid: 1234,
        success: true,
      }
    }
  )
}

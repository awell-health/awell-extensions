/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
    if (practiceId === '195900')
      return {
        patientid: '1',
      }

    return Promise.reject(
      createAxiosError(
        404,
        { 'Content-Type': 'text/html; charset=iso-8859-1' },
        JSON.stringify({
          error: 'This patient does not exist in this context.',
        })
      )
    )
  })

  getPatient = jest.fn(
    ({ practiceId, patientId }: { practiceId: string; patientId: string }) => {
      if (patientId === '56529') return mockGetPatientResponse

      return Promise.reject(
        createAxiosError(
          404,
          { 'Content-Type': 'text/html; charset=iso-8859-1' },
          JSON.stringify({
            error: 'This patient does not exist in this context.',
          })
        )
      )
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
      if (appointmentId === '1') return mockGetAppointmentResponse

      return Promise.reject(
        createAxiosError(
          404,
          { 'Content-Type': 'text/html; charset=iso-8859-1' },
          JSON.stringify({ error: 'The appointment is not available.' })
        )
      )
    }
  )
}

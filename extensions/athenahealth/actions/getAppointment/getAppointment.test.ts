import { type AxiosError } from 'axios'
import { formatISO } from 'date-fns'
import { getAppointment } from '.'
import { generateTestPayload } from '@/tests'
import {
  mockGetAppointmentResponse,
  mockSettings,
} from '../../api/__mocks__/mockData'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../api/client')

describe('athenahealth - Get appointment', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getAppointment)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should return an appointment', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentId: '1',
      },
      settings: mockSettings,
    })

    await getAppointment.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientId: mockGetAppointmentResponse.patientid,
        startTime: mockGetAppointmentResponse.starttime,
        status: mockGetAppointmentResponse.appointmentstatus,
        appointmentTypeName: mockGetAppointmentResponse.appointmenttype,
        appointmentTypeId: mockGetAppointmentResponse.appointmenttypeid,
        date: formatISO(new Date(mockGetAppointmentResponse.date), {
          representation: 'date',
        }),
        duration: String(mockGetAppointmentResponse.duration),
      },
    })
  })

  test('Should return an error when appointment is not found', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentId: '99999999999',
      },
      settings: mockSettings,
    })

    try {
      await getAppointment.onEvent!({
        payload: mockOnActivityCreateParams,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
    } catch (error) {
      const axiosError = error as AxiosError
      expect(axiosError.response).toBeDefined()
      expect(axiosError.response?.status).toBe(404)
      expect(axiosError.response?.data).toStrictEqual({
        error: 'The appointment is not available.',
      })
    }

    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should return an error when practice is not found', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentId: '1',
      },
      settings: { ...mockSettings, practiceId: '99999999999' },
    })

    try {
      await getAppointment.onEvent!({
        payload: mockOnActivityCreateParams,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
    } catch (error) {
      const axiosError = error as AxiosError
      expect(axiosError.response).toBeDefined()
      expect(axiosError.response?.status).toBe(404)
      expect(axiosError.response?.data).toStrictEqual({
        error: 'Invalid practice.',
        detailedmessage: 'The practice ID does not exist.',
      })
    }

    expect(onComplete).not.toHaveBeenCalled()
  })
})

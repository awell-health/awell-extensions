import { getPatient } from '.'
import { generateTestPayload } from '@/tests'
import { type AxiosError } from 'axios'
import {
  mockGetPatientResponse,
  mockSettings,
} from '../../api/__mocks__/mockData'
import { TestHelpers } from '@awell-health/extensions-core'
import { formatISO } from 'date-fns'

jest.mock('../../api/client')

describe('athenahealth - Get patient', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getPatient)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should return a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: '56529',
      },
      settings: mockSettings,
    })

    await getPatient.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        firstName: mockGetPatientResponse.firstname,
        lastName: mockGetPatientResponse.lastname,
        dob: formatISO(new Date(mockGetPatientResponse.dob), {
          representation: 'date',
        }),
        email: mockGetPatientResponse.email,
      },
    })
  })

  test('Should return an error when practice is not found', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: '123',
      },
      settings: { ...mockSettings, practiceId: '99999999999' },
    })

    try {
      await getPatient.onEvent!({
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

  test('Should return an error when patient is not found', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: '99999999999',
      },
      settings: mockSettings,
    })

    try {
      await getPatient.onEvent!({
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
        error: 'This patient does not exist in this context.',
      })
    }

    expect(onComplete).not.toHaveBeenCalled()
  })
})

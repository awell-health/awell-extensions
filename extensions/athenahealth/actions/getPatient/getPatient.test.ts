import { getPatient } from '.'
import { generateTestPayload } from '../../../../src/tests'
import { type AxiosError } from 'axios' // Assuming axios is being used in the function you're testing
import { mockSettings } from '../../api/__mocks__/mockData'

jest.mock('../../api/client')

describe('athenahealth - Get patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: '56529',
        practiceId: '195900',
      },
      settings: mockSettings,
    })

    await getPatient.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        firstName: 'Nick',
        lastName: 'Hellemans',
        dob: '1993-11-30',
        email: 'nick@awellhealth.com',
      },
    })
  })

  test('Should return an error when patient is not found', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: 'non-existent-patient-id',
        practiceId: '195900',
      },
      settings: mockSettings,
    })

    try {
      await getPatient.onActivityCreated(
        mockOnActivityCreateParams,
        onComplete,
        onError
      )
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

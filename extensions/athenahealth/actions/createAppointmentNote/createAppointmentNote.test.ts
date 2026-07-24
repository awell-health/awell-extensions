import { type AxiosError } from 'axios'
import { createAppointmentNote } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../api/__mocks__/mockData'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../api/client')

describe('athenahealth - Create appointment note', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    createAppointmentNote,
  )

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should create an appointment note', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentid: '1',
        notetext: 'hello world',
        displayonschedule: true,
      },
      settings: mockSettings,
    })

    await createAppointmentNote.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalled()
  })

  test('Should return an error when the appointment does not exist', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentid: '99999999999',
        notetext: 'hello world',
        displayonschedule: true,
      },
      settings: mockSettings,
    })

    try {
      await createAppointmentNote.onEvent!({
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
        appointmentid: '1',
        notetext: 'hello world',
        displayonschedule: true,
      },
      settings: { ...mockSettings, practiceId: '99999999999' },
    })

    try {
      await createAppointmentNote.onEvent!({
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

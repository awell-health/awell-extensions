import { type AxiosError } from 'axios'
import { createAppointmentNote } from '.'
import { generateTestPayload } from '../../../../src/tests'
import { mockSettings } from '../../api/__mocks__/mockData'

jest.mock('../../api/client')

describe('athenahealth - Create appointment note', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create an appointment note', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentid: '1',
        practiceid: '195900',
        notetext: 'hello world',
        displayonschedule: true,
      },
      settings: mockSettings,
    })

    await createAppointmentNote.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
  })

  test('Should return an error when the appointment does not exist', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentid: '2123223221',
        practiceid: '195900',
        notetext: 'hello world',
        displayonschedule: true,
      },
      settings: mockSettings,
    })

    try {
      await createAppointmentNote.onActivityCreated(
        mockOnActivityCreateParams,
        onComplete,
        onError
      )
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
})

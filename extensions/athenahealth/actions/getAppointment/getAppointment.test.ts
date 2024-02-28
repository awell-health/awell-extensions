import { type AxiosError } from 'axios'
import { formatISO } from 'date-fns'
import { getAppointment } from '.'
import { generateTestPayload } from '../../../../src/tests'
import { mockGetAppointmentResponse , mockSettings } from '../../api/__mocks__/mockData'

jest.mock('../../api/client')

describe('athenahealth - Get appointment', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return an appointment', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentId: '1',
        practiceId: '195900',
      },
      settings: mockSettings,
    })

    await getAppointment.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

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

  test('Should return an error when patient is not found', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentId: 'non-existent-appointment-id',
        practiceId: '195900',
      },
      settings: mockSettings,
    })

    try {
      await getAppointment.onActivityCreated(
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

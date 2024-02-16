import { getAppointment } from '.'
import { generateTestPayload } from '../../../../src/tests'

describe('Athena - Get appointment', () => {
  const settings = {
    client_id: 'hello',
    client_secret: 'world',
    auth_url: 'https://api.preview.platform.athenahealth.com/oauth2/v1/token',
    api_url: 'https://api.preview.platform.athenahealth.com',
    scope:
      'athena/service/Athenanet.MDP.* system/Observation.read system/Patient.read',
  }

  const onComplete = jest.fn()
  const onError = jest.fn()

  test('Should return an appointment', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentId: '1',
        practiceId: '1',
      },
      settings,
    })

    await getAppointment.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientId: '56529',
        startTime: '1:00 PM',
        status: 'scheduled',
        type: 'Follow-up',
        date: '2024-05-05',
      },
    })
  })
})

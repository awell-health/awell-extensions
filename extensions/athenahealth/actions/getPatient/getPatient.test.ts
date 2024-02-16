import { getPatient } from '.'
import { generateTestPayload } from '../../../../src/tests'

describe('Athena - Get patient', () => {
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

  test('Should return a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: '1',
        practiceId: '1',
      },
      settings,
    })

    await getPatient.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        firstName: 'Rik',
        lastName: 'Renard',
        dob: '1993-11-30',
        email: 'rik@awellhealth.com',
      },
    })
  })
})

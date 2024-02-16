import { addDocumentToPatientChart } from '.'
import { generateTestPayload } from '../../../../src/tests'

describe('Athena - Cancel appointment', () => {
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
        patientId: '1',
        practiceId: '1',
        departmentId: '1',
        actionNote: 'Some note',
        documentContent: 'Some content',
        autoClose: false,
      },
      settings,
    })

    await addDocumentToPatientChart.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
  })
})

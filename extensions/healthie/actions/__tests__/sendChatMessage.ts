import { sendChatMessage } from "../sendChatMessage"

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('Simple sendChatMessage action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test('Should call the onComplete callback', async () => {
    await sendChatMessage.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          healthie_patient_id: 'patient-1',
          message: 'hello',
          provider_id: 'provider-1'
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url'
        },
      },
      onComplete,
      jest.fn()
    )

    expect(onComplete).toHaveBeenCalled()
  })
})

import { sendSms } from '..'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../../common/sdk/messagebirdSdk')

describe('Send SMS', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendSms)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onEvent!({
      payload: generateTestPayload({
        fields: {
          originator: 'TestMessage', // "TestMessage" can be used for test messages
          recipient: '+32476581696',
          body: 'Hello there!',
        },
        settings: {
          apiKey: 'an-api-key',
          reportUrl: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})

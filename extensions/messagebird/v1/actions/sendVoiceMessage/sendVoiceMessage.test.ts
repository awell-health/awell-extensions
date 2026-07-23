import { sendVoiceMessage } from '..'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../../common/sdk/messagebirdSdk')

describe('Send voice message', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendVoiceMessage)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendVoiceMessage.onEvent!({
      payload: generateTestPayload({
        fields: {
          originator: 'MessageBird', // "MessageBird" can be used for test messages
          recipient: '+32476581696',
          body: 'Hi, you are a beautiful person!',
          language: 'en-gb',
          voice: 'female',
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

import { sendVoiceMessage } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/messagebirdSdk')

describe('Send voice message', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendVoiceMessage.onActivityCreated!(
      generateTestPayload({
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
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})

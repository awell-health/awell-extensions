import { sendSms } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/messagebirdSdk')

describe('Send SMS', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onActivityCreated!(
      generateTestPayload({
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
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})

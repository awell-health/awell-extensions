import { generateTestPayload } from '../../../../src/tests'
import { sendSms } from './sendSms'

describe('send SMS action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  test('Should not send a SMS', async () => {
    await sendSms.onActivityCreated(
      generateTestPayload({
        fields: {
          appId: 'appId',
          subscriptionGroupId: '234234234234',
          body: 'Hello from Braze',
        },
        settings: {
          apiUrl: 'https://api.braze.com',
          apiKey: 'somewrongapikey',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})

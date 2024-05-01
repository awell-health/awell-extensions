import { generateTestPayload } from '../../../../src/tests'
import { sendSms } from './sendSms'
jest.mock('../../client/brazeApi')

describe('send SMS action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should send a SMS and respond with dispatch_id', async () => {
    await sendSms.onActivityCreated(
      generateTestPayload({
        fields: {
          appId: 'appId',
          subscriptionGroupId: '234234234234',
          body: 'Hello from Braze',
        },
        settings: {
          apiUrl: 'https://api.braze.com',
          apiKey: 'someapikey',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: { dispatchId: 'sms-sent-id' },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should not send a SMS when apiKey is empty', async () => {
    await sendSms.onActivityCreated(
      generateTestPayload({
        fields: {
          appId: 'appId',
          subscriptionGroupId: '234234234234',
          body: 'Hello from Braze',
        },
        settings: {
          apiUrl: 'https://api.braze.com',
          apiKey: '',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Should not send a SMS when body is empty', async () => {
    await sendSms.onActivityCreated(
      generateTestPayload({
        fields: {
          appId: 'appId',
          subscriptionGroupId: '234234234234',
          body: '',
        },
        settings: {
          apiUrl: 'https://api.braze.com',
          apiKey: 'whatever',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})

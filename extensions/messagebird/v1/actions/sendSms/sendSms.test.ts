import { sendSms } from '..'

jest.mock('../../../common/sdk/messagebirdSdk')

describe('Send SMS', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          originator: '+32xxxxxxx',
          recipient: '+32xxxxxxx',
          body: 'Hello there!',
        },
        settings: {
          apiKey: 'apiKey',
          reportUrl: 'https://developers.messagebird.com/',
        },
      },
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})

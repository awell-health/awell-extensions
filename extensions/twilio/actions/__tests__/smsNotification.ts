import { smsNotification } from '../'

describe('Simple sms notification action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await smsNotification.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: 'fromNumber',
        },
      },
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
})

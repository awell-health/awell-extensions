import { smsNotification } from '../'

describe('Simple sms notification action', () => {
  const done = jest.fn()

  beforeEach(() => {
    done.mockClear()
  })

  test('Should call the done callback', async () => {
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
      done
    )
    expect(done).toHaveBeenCalled()
  })
})

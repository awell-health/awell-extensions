import { sendRequestReminder } from '..'

describe('Send request reminder action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendRequestReminder.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          signatureRequestId: '123',
          signerEmailAddress: 'hello@patient.com',
        },
        settings: {
          apiKey: 'apiKey',
        },
      },
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
})

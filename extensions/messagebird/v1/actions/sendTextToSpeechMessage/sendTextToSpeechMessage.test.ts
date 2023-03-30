import { sendTextToSpeechMessage } from '..'

describe('Send text-to-speech message', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendTextToSpeechMessage.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          originator: '+32xxxxxxx',
          recipient: '+32xxxxxxx',
          body: 'Hello there!',
          language: 'en-GB',
          voice: 'female',
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
  })
})

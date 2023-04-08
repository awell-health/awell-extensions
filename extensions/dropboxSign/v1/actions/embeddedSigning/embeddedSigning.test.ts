import { embeddedSigning } from './embeddedSigning'

describe('Complete flow action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await embeddedSigning.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          signUrl: 'https://developers.awellhealth.com',
        },
        settings: {
          apiKey: 'apiKey',
          clientId: 'client-id',
          testMode: 'yes',
        },
      },
      onComplete,
      jest.fn()
    )

    /**
     * Because completion is done in Awell Hosted Pages
     */
    expect(onComplete).not.toHaveBeenCalled()
  })
})

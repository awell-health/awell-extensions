import { embeddedSigning } from './embeddedSigning'

describe('Complete flow action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await embeddedSigning.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          signUrl: 'https://demo.docusign.net',
        },
        settings: {
          integrationKey: 'xyz123',
          accountId: 'xyz123',
          userId: 'xyz123',
          rsaKey: 'xyz123',
          baseUrl: 'https://demo.docusign.net',
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

import { generateTestPayload } from '@/tests'
import { embeddedSigning } from './embeddedSigning'

describe('Complete flow action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await embeddedSigning.onActivityCreated!(
      generateTestPayload({
        fields: {
          signUrl: 'https://demo.docusign.net',
        },
        settings: {
          integrationKey: 'xyz123',
          accountId: 'xyz123',
          userId: 'xyz123',
          rsaKey: 'xyz123',
          baseApiUrl: 'https://demo.docusign.net',
          returnUrlTemplate: '',
        },
      }),
      onComplete,
      jest.fn()
    )

    /**
     * Because completion is done in Awell Hosted Pages
     */
    expect(onComplete).not.toHaveBeenCalled()
  })
})

import { generateTestPayload } from '@/tests'
import { embeddedSigning } from './embeddedSigning'

describe('Complete flow action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback when webhook is provided', async () => {
    await embeddedSigning.onActivityCreated!(
      generateTestPayload({
        fields: {
          signUrl: 'https://demo.docusign.net',
          webhook: 'https://example.com/webhook',
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

    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback when webhook is not provided (legacy behavior)', async () => {
    await embeddedSigning.onActivityCreated!(
      generateTestPayload({
        fields: {
          signUrl: 'https://demo.docusign.net',
          webhook: undefined,
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

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        signed: 'false',
      },
    })
  })
})

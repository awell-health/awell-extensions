import { generateTestPayload } from '@/tests'
import { createEmbeddedSignatureRequestWithTemplate } from './createEmbeddedSignatureRequestWithTemplate'

jest.mock('docusign-esign', () => ({
  ApiClient: jest.fn(() => ({
    setBasePath: jest.fn(),
    requestJWTUserToken: jest.fn(),
    addDefaultHeader: jest.fn(),
  })),
  EnvelopesApi: jest.fn(() => ({
    createEnvelope: jest.fn(() => ({ envelopeId: 'envelope-1' })),
    createRecipientView: jest.fn(() => ({ url: 'test-url' })),
  })),
  TemplateRole: {
    constructFromObject: jest.fn((args: any) => args),
  },
  EnvelopeDefinition: {
    constructFromObject: jest.fn((args: any) => args),
  },
  RecipientViewRequest: {
    constructFromObject: jest.fn((args: any) => args),
  },
}))

describe('Create embedded signature request with template', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await createEmbeddedSignatureRequestWithTemplate.onActivityCreated!(
      generateTestPayload({
        fields: {
          signerRole: 'Demo',
          signerName: 'John Doe',
          signerEmailAddress: 'test@test.com',
          templateId: 'template-1',
          subject: 'DocuSign - local demo',
          message: 'DocuSign - local demo message content',
        },
        settings: {
          integrationKey: 'integrationKey',
          accountId: 'accountId',
          userId: 'userId',
          rsaKey: 'rsaKey',
          baseApiUrl: undefined,
          returnUrlTemplate: undefined,
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        envelopeId: 'envelope-1',
        signUrl: 'test-url',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})

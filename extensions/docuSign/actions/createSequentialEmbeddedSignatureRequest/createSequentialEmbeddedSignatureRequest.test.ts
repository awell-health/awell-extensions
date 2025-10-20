import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { createSequentialEmbeddedSignatureRequest } from './createSequentialEmbeddedSignatureRequest'

jest.mock('docusign-esign', () => ({
  ApiClient: jest.fn(() => ({
    setBasePath: jest.fn(),
    requestJWTUserToken: jest.fn(() => Promise.resolve({ body: { access_token: 'test-token' } })),
    addDefaultHeader: jest.fn(),
  })),
  EnvelopesApi: jest.fn(() => ({
    createEnvelope: jest.fn(() => ({ envelopeId: 'envelope-123' })),
    createRecipientView: jest.fn(() => Promise.resolve({ url: 'patient-sign-url' })),
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

describe('createSequentialEmbeddedSignatureRequest', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(createSequentialEmbeddedSignatureRequest)

  beforeEach(() => {
    clearMocks()
  })

  test('Should create sequential embedded signature request successfully', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          templateId: 'template-123',
          subject: 'Test Subject',
          message: 'Test Message',
          patientSignerRole: 'Patient',
          patientSignerName: 'John Doe',
          patientSignerEmail: 'patient@example.com',
          providerSignerRole: 'Provider',
          providerSignerName: 'Dr. Smith',
          providerSignerEmail: 'provider@example.com',
          providerClientUserId: 'provider-123',
        },
        settings: {
          integrationKey: 'test-key',
          accountId: 'test-account',
          userId: 'test-user',
          rsaKey: 'test-rsa-key',
          baseApiUrl: 'https://demo.docusign.net',
          returnUrlTemplate: 'https://example.com/return',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        envelopeId: 'envelope-123',
        recipient1SignUrl: 'patient-sign-url',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})

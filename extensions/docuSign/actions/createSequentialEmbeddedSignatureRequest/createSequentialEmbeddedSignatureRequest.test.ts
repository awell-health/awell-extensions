import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { createSequentialEmbeddedSignatureRequest } from './createSequentialEmbeddedSignatureRequest'

const MOCK_RSA_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bS1+fWIcPm15j9zB/FbeJ+MPA3mg+pKv1HWHZrPNX4tKHHtd
SdJYk1FCHSxqpoQYhD5L4aLn+KWfqwZqcAOCAQ==
-----END PRIVATE KEY-----`

const MOCK_RSA_PRIVATE_KEY_BASE64 = Buffer.from(MOCK_RSA_PRIVATE_KEY).toString('base64')

jest.mock('docusign-esign', () => ({
  ApiClient: jest.fn(() => ({
    setBasePath: jest.fn(),
    requestJWTUserToken: jest.fn(() => Promise.resolve({ body: { access_token: 'test-token' } })),
    addDefaultHeader: jest.fn(),
  })),
  EnvelopesApi: jest.fn(() => ({
    createEnvelope: jest.fn(() => ({ envelopeId: 'envelope-123' })),
    createRecipientView: jest.fn(() => Promise.resolve({ url: 'https://docusign.com/recipient1-sign-url' })),
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
          rsaKey: MOCK_RSA_PRIVATE_KEY_BASE64,
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
        recipient1SignUrl: 'https://docusign.com/recipient1-sign-url',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})

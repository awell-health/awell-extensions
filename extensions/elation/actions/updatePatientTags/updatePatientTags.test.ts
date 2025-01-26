import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { updatePatientTags as action } from './updatePatientTags'

// Mock the client
jest.mock('../../client')

// Mock createOpenAIModel
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      pipe: jest.fn().mockReturnValue({
        invoke: jest.fn().mockResolvedValue({
          updatedTags: ['test', 'test2'],
          explanation: 'Test explanation'
        })
      })
    },
    metadata: {
      care_flow_definition_id: 'whatever',
      care_flow_id: 'test-flow-id',
      activity_id: 'test-activity-id'
    },
    callbacks: []
  })
}))

describe('Elation - Update patient tags', () => {
  const {
    extensionAction: updatePatientTags,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('Should update tags using custom API key', async () => {
    await updatePatientTags.onEvent({
      payload: {
        fields: {
          patientId: 123,
          instructions: 'Add the tags "test" and "test2"',
        },
        settings: {
          client_id: 'clientId',
          client_secret: 'clientSecret',
          username: 'username',
          password: 'password',
          auth_url: 'authUrl',
          base_url: 'baseUrl',
          openAiApiKey: 'custom-key',
        },
        pathway: {
          id: 'test-flow-id',
          definition_id: '123',
          tenant_id: '123',
          org_slug: 'test-org-slug',
          org_id: 'test-org-id'
        },
        activity: {
          id: 'test-activity-id'
        },
        patient: {
          id: 'test-patient-id'
        }
      },
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        updatedTags: 'test, test2',
        explanation: 'Test explanation',
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Previous patient tags: No tags\nUpdated patient tags: test, test2\nExplanation: Test explanation',
          },
        },
      ],
    })
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should use default OpenAI config', async () => {
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: 'default-key',
      temperature: 0,
      maxRetries: 3
    })

    await updatePatientTags.onEvent({
      payload: {
        fields: {
          patientId: 123,
          instructions: 'Add the tags "test" and "test2"',
        },
        settings: {
          client_id: 'clientId',
          client_secret: 'clientSecret',
          username: 'username',
          password: 'password',
          auth_url: 'authUrl',
          base_url: 'baseUrl',
        },
        pathway: {
          id: 'test-flow-id',
          definition_id: '123',
          tenant_id: '123',
          org_slug: 'test-org-slug',
          org_id: 'test-org-id'
        },
        activity: {
          id: 'test-activity-id'
        },
        patient: {
          id: 'test-patient-id'
        }
      },
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        updatedTags: 'test, test2',
        explanation: 'Test explanation',
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Previous patient tags: No tags\nUpdated patient tags: test, test2\nExplanation: Test explanation',
          },
        },
      ],
    })
    expect(onError).not.toHaveBeenCalled()
  })
})

import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { checkPatientTags as action } from './checkPatientTags'

// Mock the client
jest.mock('../../client')

// Mock createOpenAIModel
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      pipe: jest.fn().mockReturnValue({
        invoke: jest.fn().mockResolvedValue({
          tagsFound: true,
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

describe('Elation - Check patient tags', () => {
  const {
    extensionAction: checkPatientTags,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  const basePayload = {
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
  }

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('Should check tags using custom API key', async () => {
    await checkPatientTags.onEvent({
      payload: {
        ...basePayload,
        settings: {
          ...basePayload.settings,
          openAiApiKey: 'custom-key',
        },
        fields: {
          patientId: 123,
          instructions: 'Check if patient has "Eligible" tag',
        }
      },
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        tagsFound: 'true',
        explanation: 'Test explanation',
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Patient tags: No tags\nInstruction: Check if patient has "Eligible" tag\nResult: true\nExplanation: Test explanation',
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

    await checkPatientTags.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 123,
          instructions: 'Check if patient has "Eligible" tag',
        }
      },
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        tagsFound: 'true',
        explanation: 'Test explanation',
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Patient tags: No tags\nInstruction: Check if patient has "Eligible" tag\nResult: true\nExplanation: Test explanation',
          },
        },
      ],
    })
    expect(onError).not.toHaveBeenCalled()
  })
}) 
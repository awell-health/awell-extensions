import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { checkPatientTags } from './checkPatientTags'
/**
 * NOTE: These tests make real calls to OpenAI and should be run whenever changes are made
 * to the LLM-related components (prompts, parsing, etc.) to verify the integration continues
 * working as expected.
 */

jest.mock('../../client')
jest.setTimeout(60000) // Increased timeout to 60 seconds

describe.skip('checkPatientTags - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(checkPatientTags)

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
      org_id: 'test-org-id',
    },
    activity: {
      id: 'test-activity-id',
    },
    patient: {
      id: 'test-patient-id',
    },
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()

    // Ensure API key is always defined
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key'

    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 2,
      timeout: 30000,
    })

    // Mock Elation client with existing tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: ['Eligible', 'Active'],
      }),
    }))
  })

  it('Should check for single tag using real OpenAI', async () => {
    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 123,
          instructions: 'Check if patient has "Eligible" tag',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Wait for all promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 1000))

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)

  it('Should check for multiple required tags', async () => {
    // Mock existing tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: ['Eligible', 'Active', 'High Risk'],
      }),
    }))

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 123,
          instructions:
            'Check if patient has both "Eligible" and "High Risk" tags',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)

  it('Should check for tag absence', async () => {
    // Mock existing tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: ['Active', 'High Risk'],
      }),
    }))

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 123,
          instructions: 'Check if patient does NOT have "Eligible" tag',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)

  it('Should handle conditional tag checks', async () => {
    // Mock existing tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: ['High Risk', 'Fall Risk'],
      }),
    }))

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 123,
          instructions:
            'If patient has "High Risk" tag, then they must also have "Fall Risk" tag',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)

  it('Should handle empty patient tags', async () => {
    // Mock existing tags as empty
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: [],
      }),
    }))

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 123,
          instructions: 'Check if patient has "Eligible" tag',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)

  it('Should handle complex care program tag combinations', async () => {
    // Mock existing tags with multiple care program tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: [
          'CCM 2 – COPD',
          'CCM 3 – COPD',
          'CCM 2 – ASCVD',
          'CCM 3 – ASCVD',
          'Fall Risk',
          'High Risk',
        ],
      }),
    }))

    await extensionAction.onEvent({
      payload: {
        fields: {
          patientId: 123,
          instructions:
            'Check if patient has both COPD and ASCVD care program tags at level 3',
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
          org_id: 'test-org-id',
        },
        activity: {
          id: 'test-activity-id',
        },
        patient: {
          id: 'test-patient-id',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)

  it('Should handle facility and mobility tag combinations', async () => {
    // Mock existing tags with facility and mobility related tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: [
          'ALF/SNF',
          'Mobility Assist',
          'No BP in Left Arm',
          'Fall Risk',
          'High Risk',
          'DNR',
        ],
      }),
    }))

    await extensionAction.onEvent({
      payload: {
        fields: {
          patientId: 123,
          instructions:
            'Check if patient has facility tag (ALF/SNF) and either Mobility Assist or Fall Risk tag',
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
          org_id: 'test-org-id',
        },
        activity: {
          id: 'test-activity-id',
        },
        patient: {
          id: 'test-patient-id',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)
})

import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { updatePatientTags } from './updatePatientTags'

jest.mock('../../client')
jest.setTimeout(60000) // Increased timeout to 60 seconds

describe.skip('updatePatientTags - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(updatePatientTags)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    
    // Ensure API key is always defined
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key'
    
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 2,
      timeout: 30000
    })

    // Mock Elation client with existing tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: ['diabetes', 'hypertension']
      }),
      updatePatient: jest.fn().mockResolvedValue({})
    }))
  })

  it('Should update tags using real OpenAI', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          patientId: 123,
          instructions: 'Remove tag "diabetes" and add tag "chronic_pain"',
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

    // Wait for all promises to resolve
    await new Promise(resolve => setTimeout(resolve, 1000))

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000) // Increased individual test timeout

  it('Should handle COPD care program tag updates', async () => {
    // Mock existing tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: ['CCM 2 – COPD ', 'Fall Risk']
      }),
      updatePatient: jest.fn().mockResolvedValue({})
    }))

    await extensionAction.onEvent({
      payload: {
        fields: {
          patientId: 123,
          instructions: "Look for a COPD Care Program tag 'CCM 2 – COPD '. If found, remove it. Then add 'CCM 3 – COPD.'. Keep the rest.",
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

    await new Promise(resolve => setTimeout(resolve, 1000))
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)

  it('Should handle ASCVD care program tag updates', async () => {
    // Mock existing tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: ['CCM 2 – ASCVD', 'CCM 3 – ASCVD', 'DNR']
      }),
      updatePatient: jest.fn().mockResolvedValue({})
    }))

    await extensionAction.onEvent({
      payload: {
        fields: {
          patientId: 123,
          instructions: "Remove all ASCVD-related care program tags. Then add 'CCM 3 – ASCVD'. Keep other tags.",
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

    await new Promise(resolve => setTimeout(resolve, 1000))
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)

  it('Should handle mobility and facility tag updates', async () => {
    // Mock existing tags
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation((settings) => ({
      ...makeAPIClientMockFunc(settings),
      getPatient: jest.fn().mockResolvedValue({
        tags: ['Mobility Assist', 'No BP in Left Arm']
      }),
      updatePatient: jest.fn().mockResolvedValue({})
    }))

    await extensionAction.onEvent({
      payload: {
        fields: {
          patientId: 123,
          instructions: "If 'Mobility Assist' is found, remove it. Then add 'ALF/SNF' if the patient is in a facility. Keep everything else.",
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

    await new Promise(resolve => setTimeout(resolve, 1000))
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 60000)
}) 
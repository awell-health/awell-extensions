import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeCareFlow } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { DISCLAIMER_MSG } from '../../lib/constants'


jest.setTimeout(60000)

describe.skip('summarizeCareFlow - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeCareFlow)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    
    // Ensure API key is always defined
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key'
    
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY as string,
      temperature: 0,
      maxRetries: 3,
      timeout: 10000
    })

    // Mock the SDK query to return activities
    const mockQuery = jest.fn()
      .mockResolvedValueOnce({
        pathwayActivities: {
          success: true,
          activities: [{
            id: 'test-activity-id',
            status: 'DONE',
            date: '2024-01-01T00:00:00Z',
            object: {
              id: 'test-object-id',
              name: 'Test Activity',
              type: 'FORM'
            }
          }]
        }
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery
      }
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    // Clean up any remaining promises
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  it('Should call the real model using default config', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: '',
      },
      settings: {}, // Use default config
      activity: {
        id: 'test-activity-id'
      }
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers: helpers 
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(DISCLAIMER_MSG),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should call the real model with different instructions', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Focus only on actions completed by the patient.',
      },
      settings: {}, // Use default config
      activity: {
        id: 'test-activity-id'
      }
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers: helpers
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(DISCLAIMER_MSG),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})

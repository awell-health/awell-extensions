import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeCareFlow } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { DISCLAIMER_MSG } from '../../lib/constants'


jest.setTimeout(60000)

// remove skip to run this test
describe.skip('summarizeCareFlow - Real LLM calls with mocked Awell SDK', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeCareFlow)

  // Ensure API key exists
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required for tests')
  }

  // Setup helpers with complete OpenAI config
  const mockHelpers = {
    ...helpers,
    getOpenAIConfig: () => ({
      apiKey,
      temperature: 0,
      maxRetries: 3,
      timeout: 10000
    }),
    awellSdk: jest.fn().mockResolvedValue({
      orchestration: {
        query: jest.fn().mockResolvedValue({
          pathwayActivities: mockPathwayActivitiesResponse,
        }),
      },
    })
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
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
      helpers: mockHelpers 
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
      helpers: mockHelpers
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(DISCLAIMER_MSG),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})

import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { categorizeMessage } from '.'
import 'dotenv/config'

describe('categorizeMessage - Real LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(categorizeMessage)

  // Ensure API key exists
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required for tests')
  }

  // Setup helpers with complete OpenAI config
  const mockHelpers = {
    ...helpers,
    getOpenAIConfig: () => ({
      apiKey,  // Now TypeScript knows this is definitely a string
      temperature: 0,
      maxRetries: 3,
      timeout: 10000
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

  it('should successfully categorize a message about scheduling an appointment using real LLM', async () => {
    const payload = generateTestPayload({
      fields: {
        message: 'I would like to schedule an appointment for next week.',
        categories: 'Appointment Scheduling,Medication Questions,Administrative Assistance,Feedback or Complaints',
      },
      settings: {}, // Remove openAiApiKey from settings to use default
      pathway: {
        id: 'test-pathway-id',
        definition_id: 'test-def-id'
      },
      activity: {
        id: 'test-activity-id'
      }
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers: mockHelpers // Use our mocked helpers
    })

    // Real LangChain function is called
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        category: 'Appointment Scheduling',
        explanation: expect.stringMatching(/^<p>.*appointment.*<\/p>$/),
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('should return "None" when the message does not match any category using real LLM', async () => {
    const payload = generateTestPayload({
      fields: {
        message: 'What books do you like ro read?',
        categories:
          'Appointment Scheduling,Medication Questions,Administrative Assistance,Feedback or Complaints',
      },
      settings: {}, // Remove openAiApiKey from settings to use default
      pathway: {
        id: 'test-pathway-id',
        definition_id: 'test-def-id',
      },
      activity: {
        id: 'test-activity-id',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers: mockHelpers // Use our mocked helpers
    })

    // Real LangChain function is called and returns "None"
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        category: 'None',
        explanation: expect.stringMatching(/^<p>.*<\/p>$/),
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

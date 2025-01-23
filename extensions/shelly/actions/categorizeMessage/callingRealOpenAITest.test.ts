import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { categorizeMessage } from '.'
import 'dotenv/config'

const settings = {
  openAiApiKey: process.env.OPENAI_API_KEY,
}

describe('categorizeMessage - Real LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(categorizeMessage)

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
      settings,
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
      helpers,
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
      settings,
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
      helpers,
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

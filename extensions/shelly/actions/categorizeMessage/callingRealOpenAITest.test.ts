import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '../../../../../src/tests'
import { categorizeMessage } from '.'
import 'dotenv/config'

const settings = {
  openAiApiKey: process.env.OPENAI_TEST_KEY,
}

// Remove skip to run the test
describe.skip('categorizeMessage - Real LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(categorizeMessage)

  beforeEach(() => {
    clearMocks() // Reset mocks before each test
    jest.clearAllMocks() // Reset any mock functions
  })

  it('should successfully categorize a message about scheduling an appointment using real LLM', async () => {
    const payload = generateTestPayload({
      fields: {
        message: 'I would like to schedule an appointment for next week.',
        categories:
          'Appointment Scheduling,Medication Questions,Administrative Assistance,Feedback or Complaints',
      },
      settings,
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
        explanation:
          'The message explicitly states a desire to schedule an appointment, which directly aligns with the Appointment Scheduling category.',
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
        explanation:
          'Categorization was ambiguous; we could not find a proper category.',
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

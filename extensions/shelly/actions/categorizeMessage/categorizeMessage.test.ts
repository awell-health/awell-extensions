import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { categorizeMessage } from '.'

// Mock the module
jest.mock('@langchain/openai', () => {
  const mockInvoke = jest.fn().mockResolvedValue({
    matched_entity: 'Appointment Scheduling',
  })

  const mockChain = {
    invoke: mockInvoke,
  }

  const mockPipe = jest.fn().mockReturnValue(mockChain)

  const mockChatOpenAI = jest.fn().mockImplementation(() => ({
    pipe: mockPipe,
  }))

  return {
    ChatOpenAI: mockChatOpenAI,
  }
})

// Now import ChatOpenAI after mocking - TODO: possible improve this
import { ChatOpenAI } from '@langchain/openai'

describe('categorizeMessage - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(categorizeMessage)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('should work', async () => {
    const categorizeMessageWithLLMSpy = jest.spyOn(
      require('./lib/categorizeMessageWithLLM'),
      'categorizeMessageWithLLM'
    )

    const payload = generateTestPayload({
      fields: {
        message: 'I would like to schedule an appointment for next week.',
        categories:
          'Appointment Scheduling,Medication Questions,Administrative Assistance,Feedback or Complaints',
      },
      settings: {
        openAiApiKey: 'a',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(ChatOpenAI).toHaveBeenCalled()
    expect(categorizeMessageWithLLMSpy).toHaveBeenCalledWith({
      ChatModelGPT4o: expect.any(Object),
      message: 'I would like to schedule an appointment for next week.',
      categories: [
        'Appointment Scheduling',
        'Medication Questions',
        'Administrative Assistance',
        'Feedback or Complaints',
      ],
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        category: 'Appointment Scheduling',
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

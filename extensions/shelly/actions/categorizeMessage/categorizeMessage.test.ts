import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { categorizeMessage } from '.'
import { OpenAI } from '@langchain/openai'

jest.mock('@langchain/openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    pipe: jest.fn().mockReturnThis(),
    invoke: jest.fn().mockResolvedValue({
      matched_entity: 'Appointment Scheduling',
    }),
  })),
}))

const mockedOpenAiSdk = jest.mocked(OpenAI)

describe('categorizeMessage - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(categorizeMessage)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('should work', async () => {
    const mockedOpenAiInstance = new OpenAI()

    jest.spyOn(mockedOpenAiInstance, 'invoke').mockResolvedValue({
      // @ts-expect-error fine, we have a parser
      matched_entity: 'Appointment Scheduling',
    })

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

    expect(mockedOpenAiSdk).toHaveBeenCalled()
    expect(categorizeMessageWithLLMSpy).toHaveBeenCalledWith({
      langChainOpenAiSdk: expect.any(Object), // If you want to match the instance more specifically, adjust this
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
        category: 'Appointment Scheduling', // Expected category
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeCareFlow } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { DISCLAIMER_MSG } from '../../lib/constants'

// Mock the '@langchain/openai' module
jest.mock('@langchain/openai', () => {
  // Mock the 'invoke' method to return a resolved value
  const mockInvoke = jest.fn().mockResolvedValue({
    content: 'Mocked care flow summary from LLM',
  })

  // Mock the ChatOpenAI class
  const mockChatOpenAI = jest.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  }))

  return {
    ChatOpenAI: mockChatOpenAI,
  }
})

// Import ChatOpenAI after mocking
import { ChatOpenAI } from '@langchain/openai'

describe('summarizeCareFlow - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeCareFlow)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('Should summarize care flow with LLM', async () => {
    // Spy on the 'summarizeCareFlowWithLLM' function
    const summarizeCareFlowWithLLMSpy = jest.spyOn(
      require('./lib/summarizeCareFlowWithLLM'),
      'summarizeCareFlowWithLLM'
    )

    // Create the test payload
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Summarize key activities.',
      },
      settings: {
        openAiApiKey: 'a',
      },
    })

    // Mock the Awell SDK
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          pathwayActivities: mockPathwayActivitiesResponse,
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    // Execute the action
    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    // Assertions
    expect(ChatOpenAI).toHaveBeenCalled()
    expect(summarizeCareFlowWithLLMSpy).toHaveBeenCalledWith({
      ChatModelGPT4o: expect.any(Object),
      careFlowActivities: expect.any(String),
      stakeholder: 'Clinician',
      additionalInstructions: 'Summarize key activities.',
    })

    const expected = `<p>Important Notice: The content provided is an AI-generated summary</p>
<p>Mocked care flow summary from LLM</p>`

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

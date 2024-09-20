// Import necessary modules and functions
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeForm } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { mockFormDefinitionResponse } from './__mocks__/formDefinitionResponse'
import { mockFormResponseResponse } from './__mocks__/formResponseResponse'
import { DISCLAIMER_MSG } from '../../lib/constants'

// Mock the '@langchain/openai' module
jest.mock('@langchain/openai', () => {
  // Mock the 'invoke' method to return a resolved value
  const mockInvoke = jest.fn().mockResolvedValue({
    content: 'Mocked summary from LLM',
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

describe('summarizeForm - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('Should work', async () => {
    // Spy on the 'summarizeFormWithLLM' function
    const summarizeFormWithLLMSpy = jest.spyOn(
      require('./lib/summarizeFormWithLLM'),
      'summarizeFormWithLLM'
    )

    // Create the test payload
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      patient: { id: 'whatever' },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Please focus on key symptoms.',
      },
      settings: {
        openAiApiKey: 'a',
      },
    })

    // Mock the Awell SDK
    const awellSdkMock = {
      orchestration: {
        mutation: jest.fn().mockResolvedValue({}),
        query: jest
          .fn()
          .mockResolvedValueOnce({
            pathwayActivities: mockPathwayActivitiesResponse,
          })
          .mockResolvedValueOnce({
            form: mockFormDefinitionResponse,
          })
          .mockResolvedValueOnce({
            formResponse: mockFormResponseResponse,
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
    expect(summarizeFormWithLLMSpy).toHaveBeenCalledWith({
      ChatModelGPT4o: expect.any(Object),
      formData: expect.any(String),
      stakeholder: 'Clinician',
      additionalInstructions: 'Please focus on key symptoms.',
    })

    const expected = `<p>Important Notice: The content provided is an AI-generated summary</p>
<p>Mocked summary from LLM</p>`

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

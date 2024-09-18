import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeCareFlow } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'

// Import ChatOpenAI to use real model calls
import { ChatOpenAI } from '@langchain/openai'

// remove .skip to run this test
describe('summarizeCareFlow - Real LLM calls with mocked Awell SDK', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeCareFlow)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('Should call the real model and use mocked care flow activities', async () => {
    // Set up payload
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additional_instructions: 'Summarize activities focusing on important steps.',
      },
      settings: {
        openAiApiKey: process.env.OPENAI_TEST_KEY, // Use your actual OpenAI API key here
      },
    })

    // Mock the Awell SDK to return care flow activities
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          pathwayActivities: mockPathwayActivitiesResponse,
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    // Execute the action without mocking ChatOpenAI (real call)
    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    // Assertions for the Awell SDK mock
    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(1)

    // Ensure that the model has actually been called (real call to ChatOpenAI)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining('plugin'),
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

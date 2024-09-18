import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeForm } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { mockFormDefinitionResponse } from './__mocks__/formDefinitionResponse'
import { mockFormResponseResponse } from './__mocks__/formResponseResponse'

// remove skip to run this test
describe.skip('summarizeForm - Real LLM calls with mocked Awell SDK', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('Should call the real model and use mocked form data', async () => {
    // Set up payload
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      patient: { id: 'whatever' },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Report only contact information',
      },
      settings: {
        openAiApiKey: process.env.OPENAI_TEST_KEY, // Use your actual OpenAI API key here
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

    // Execute the action without mocking ChatOpenAI
    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    // Assertions for the Awell SDK mock
    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(3)

    // Ensure that the model has actually been called (real call to ChatOpenAI)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining('32476581696'),
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

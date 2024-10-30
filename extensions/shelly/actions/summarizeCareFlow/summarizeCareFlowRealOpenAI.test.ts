import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '../../../../../src/tests'
import { summarizeCareFlow } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'

// remove .skip to run this test
describe.skip('summarizeCareFlow - Real LLM calls with mocked Awell SDK', () => {
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
        additionalInstructions: '',
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
        summary: expect.stringContaining('step'),
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('Should call the real model and focus on patient-completed actions', async () => {
    // Set up payload
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions:
          'Focus only on actions completed by the patient.',
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
        summary: expect.stringContaining('patient'),
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

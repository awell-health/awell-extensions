import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeCareFlow } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { DISCLAIMER_MSG } from '../../lib/constants'

// Mock createOpenAIModel
jest.mock('../../../../src/lib/llm/openai', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      invoke: jest.fn().mockResolvedValue({
        content: 'Mocked care flow summary from LLM'
      })
    },
    metadata: {
      traceId: 'test-trace-id',
      care_flow_definition_id: 'whatever',
      care_flow_id: 'ai4rZaYEocjB',
      activity_id: 'test-activity-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }
  })
}))

describe('summarizeCareFlow - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeCareFlow)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})  // Suppress console.error
  })

  it('Should summarize care flow with LLM', async () => {
    const summarizeCareFlowWithLLMSpy = jest.spyOn(
      require('./lib/summarizeCareFlowWithLLM'),
      'summarizeCareFlowWithLLM'
    )

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
        openAiApiKey: 'test-key',
      },
    })

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          pathwayActivities: mockPathwayActivitiesResponse,
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(summarizeCareFlowWithLLMSpy).toHaveBeenCalledWith({
      model: expect.any(Object),
      careFlowActivities: expect.any(String),
      stakeholder: 'Clinician',
      additionalInstructions: 'Summarize key activities.',
      metadata: expect.objectContaining({
        traceId: 'test-trace-id',
        care_flow_definition_id: 'whatever',
        care_flow_id: 'ai4rZaYEocjB',
        activity_id: 'test-activity-id'
      }),
    })

    const expected = `<p>${DISCLAIMER_MSG}</p>
<p>Mocked care flow summary from LLM</p>`

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('Should handle errors gracefully', async () => {
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
        openAiApiKey: 'test-key',
      },
    })

    // Mock SDK to throw a specific error
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockRejectedValue(new Error('SDK query failed'))
      }
    }
    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    // Expect the action to throw
    await expect(
      extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
      })
    ).rejects.toThrow('SDK query failed')

    // Verify error handling
    expect(onComplete).not.toHaveBeenCalled()
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(1)
  })
})

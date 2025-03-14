import { TestHelpers } from '@awell-health/extensions-core'
import { summarizeTrackOutcome } from '.'
import { mockPathwayDetails } from './__mocks__/mockPathwayDetails'
import { mockTrackData } from './__mocks__/mockTrackData'

// Mock getTrackData
jest.mock('../../lib/getTrackData/index', () => {
  const actual = jest.requireActual('../../lib/getTrackData/index')
  return {
    ...actual,
    getTrackData: jest.fn()
  }
})

// Mock getCareFlowDetails
jest.mock('../../lib/getCareFlowDetails', () => ({
  getCareFlowDetails: jest.fn().mockResolvedValue({
    title: 'AI Actions Check',
    id: 'ty0CmaHm2jlX',
    version: 6
  })
}))

// Mock createOpenAIModel
jest.mock('../../../../src/lib/llm/openai', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      invoke: jest.fn().mockResolvedValue({
        content: `## Outcome:
The patient's medication refill request was processed successfully.

## Details supporting the outcome:
- Patient John Doe requested a refill for Lisinopril 10mg
- The request was categorized as a Medication Refill Request
- Dr. Smith approved and processed the refill for 90 days
- The prescription was sent to CVS Pharmacy
- A follow-up blood pressure check was recommended in 30 days`
      })
    },
    metadata: {
      traceId: 'test-trace-id',
      care_flow_definition_id: 'ty0CmaHm2jlX',
      care_flow_id: 'xQ2P4uBn2cY8',
      activity_id: 'test-activity-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    },
    callbacks: []
  })
}))

describe('summarizeTrackOutcome - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeTrackOutcome)

  const basePayload = {
    settings: {
      openAiApiKey: 'test-key',
    },
    pathway: {
      id: 'xQ2P4uBn2cY8',
      definition_id: 'ty0CmaHm2jlX',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    },
    activity: {
      id: 'test-activity-id'
    },
    fields: {
      instructions: 'Summarize track outcome.'
    },
    patient: {
      id: 'test-patient-id'
    }
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    const { getTrackData } = require('../../lib/getTrackData/index')
    getTrackData.mockResolvedValue(mockTrackData)
    jest.spyOn(console, 'error').mockImplementation(() => {}) // Suppress console.error
  })

  it('Should summarize track outcome with LLM and include key information', async () => {
    const summarizeTrackOutcomeWithLLMSpy = jest.spyOn(
      require('./lib/summarizeTrackOutcomeWithLLM'),
      'summarizeTrackOutcomeWithLLM'
    )

    const awellSdkMock = {
      orchestration: {
        query: jest.fn()
          .mockImplementation(({ activity, pathway }) => {
            if (activity) {
              return Promise.resolve({
                activity: {
                  success: true,
                  activity: {
                    id: 'test-activity-id',
                    context: {
                      track_id: 'test-track-id'
                    }
                  }
                }
              })
            }
            if (pathway) {
              return Promise.resolve(mockPathwayDetails)
            }
          })
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
    })

    // Verify the LLM function was called with correct parameters
    expect(summarizeTrackOutcomeWithLLMSpy).toHaveBeenCalledWith({
      model: expect.any(Object),
      trackActivities: expect.any(String),
      instructions: 'Summarize track outcome.',
      metadata: expect.objectContaining({
        traceId: 'test-trace-id',
        care_flow_definition_id: 'ty0CmaHm2jlX',
        care_flow_id: 'xQ2P4uBn2cY8',
        activity_id: 'test-activity-id'
      }),
      callbacks: expect.any(Array)
    })

    // Verify the disclaimer is included
    const expectedDisclaimerMsg = `Important Notice: The content provided is an AI-generated summary of version 6 of Care Flow "AI Actions Check" (ID: ty0CmaHm2jlX).`
    
    // Verify onComplete was called with the expected data
    expect(onComplete).toHaveBeenCalled()
    const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary
    
    // Check for disclaimer
    expect(summaryData).toContain(expectedDisclaimerMsg)
    
    // Check for key information from the mock LLM response
    expect(summaryData).toContain('medication refill request was processed successfully')
    expect(summaryData).toContain('Lisinopril 10mg')
    expect(summaryData).toContain('Dr. Smith approved')
    expect(summaryData).toContain('90 days')
    expect(summaryData).toContain('CVS Pharmacy')
    expect(summaryData).toContain('follow-up blood pressure check')

    // Verify no errors occurred
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should handle errors when SDK query fails', async () => {
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockRejectedValue(new Error('SDK query failed'))
      }
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    // Reset the getCareFlowDetails mock to ensure it's not called
    const { getCareFlowDetails } = require('../../lib/getCareFlowDetails')
    getCareFlowDetails.mockReset()

    // Expect the action to throw
    await expect(
      extensionAction.onEvent({
        payload: basePayload,
        onComplete,
        onError,
        helpers,
      })
    ).rejects.toThrow('SDK query failed')

    // Verify error handling
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('Should handle errors when getTrackData fails', async () => {
    const { getTrackData } = require('../../lib/getTrackData/index')
    getTrackData.mockRejectedValue(new Error('Failed to get track data'))

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockImplementation(({ activity }) => {
          if (activity) {
            return Promise.resolve({
              activity: {
                success: true,
                activity: {
                  id: 'test-activity-id',
                  context: {
                    track_id: 'test-track-id'
                  }
                }
              }
            })
          }
          return Promise.resolve({})
        })
      }
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    // Expect the action to throw
    await expect(
      extensionAction.onEvent({
        payload: basePayload,
        onComplete,
        onError,
        helpers,
      })
    ).rejects.toThrow('Failed to get track data')

    // Verify error handling
    expect(onComplete).not.toHaveBeenCalled()
  })
}) 
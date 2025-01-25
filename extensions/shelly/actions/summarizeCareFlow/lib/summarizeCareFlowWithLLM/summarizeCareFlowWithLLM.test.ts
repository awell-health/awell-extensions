import 'dotenv/config'
import { summarizeCareFlowWithLLM } from './summarizeCareFlowWithLLM'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessageChunk } from '@langchain/core/messages'
import { mockPathwayActivitiesResponse } from '../../__mocks__/pathwayActivitiesResponse'
import { systemPrompt } from './prompt'

// Describe the test suite
describe('summarizeCareFlowWithLLM', () => {
  let mockModel: jest.Mocked<ChatOpenAI>

  beforeEach(() => {
    mockModel = {
      invoke: jest.fn(),
    } as unknown as jest.Mocked<ChatOpenAI>
  })

  it('should generate a summary using the LLM model', async () => {
    // Setup mock response
    const mockedSummary = 'On September 11, 2024, a form was completed, followed by a step completion in the care flow. The clinician reviewed and performed several actions to proceed.'
    mockModel.invoke.mockResolvedValueOnce(new AIMessageChunk(mockedSummary))

    // Prepare test data
    const careFlowData = mockPathwayActivitiesResponse.activities
      .map((activity) => {
        const { date, status, object, context } = activity
        return `Date: ${date}\nStatus: ${status}\nType: ${object.type}\nStep ID: ${context.step_id ?? 'N/A'}`
      })
      .join('\n\n')

    const stakeholder = 'Clinician'
    const additionalInstructions = 'Summarize the care flow activities, ensuring they are in chronological order.'
    const metadata = {
      traceId: 'test-trace-id',
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      activity_id: 'test-activity-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }

    // Execute the function
    const summary = await summarizeCareFlowWithLLM({
      model: mockModel,
      careFlowActivities: careFlowData,
      stakeholder,
      additionalInstructions,
      metadata,
    })

    // Verify the results
    expect(summary).toBe(mockedSummary)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)

    // Verify the prompt formatting
    const expectedPrompt = await systemPrompt.format({
      stakeholder,
      additionalInstructions,
      input: careFlowData,
    })
    
    expect(mockModel.invoke).toHaveBeenCalledWith(
      expectedPrompt,
      { metadata, runName: 'ShellySummarizeCareFlow' }
    )
  })

  it('should throw an error when LLM call fails', async () => {
    // Setup mock error
    const errorMessage = 'LLM API Error'
    mockModel.invoke.mockRejectedValueOnce(new Error(errorMessage))

    // Prepare test data
    const testData = {
      model: mockModel,
      careFlowActivities: 'test data',
      stakeholder: 'Patient',
      additionalInstructions: 'test instructions',
      metadata: { 
        tenant_id: 'test-tenant-id',
        org_slug: 'test-org-slug',
        org_id: 'test-org-id',
        care_flow_definition_id: 'test-def-id',
        care_flow_id: 'test-flow-id',
        activity_id: 'test-activity-id'
      },
    }

    // Verify error handling
    await expect(summarizeCareFlowWithLLM(testData))
      .rejects
      .toThrow('Failed to summarize the care flow due to an internal error.')
  })
})

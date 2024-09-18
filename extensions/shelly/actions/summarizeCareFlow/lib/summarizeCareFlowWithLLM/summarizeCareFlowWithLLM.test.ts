import 'dotenv/config'
import { summarizeCareFlowWithLLM } from './summarizeCareFlowWithLLM'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessageChunk } from '@langchain/core/messages'
import { mockPathwayActivitiesResponse } from '../../__mocks__/pathwayActivitiesResponse'

// Describe the test suite
describe('summarizeCareFlowWithLLM', () => {
  let ChatModelGPT4oMock: jest.Mocked<ChatOpenAI>

  beforeEach(() => {
    // Define the 'invoke' method in the mock
    ChatModelGPT4oMock = {
      invoke: jest.fn(),
    } as unknown as jest.Mocked<ChatOpenAI>
  })

  it('should return a mocked summary for the care flow activities', async () => {
    const mockedSummary =
      'On September 11, 2024, a form was completed, followed by a step completion in the care flow. The clinician reviewed and performed several actions to proceed.'

    // Mock the 'invoke' method to return an AIMessage
    ChatModelGPT4oMock.invoke.mockResolvedValueOnce(
      new AIMessageChunk(mockedSummary)
    )

    const careFlowData = mockPathwayActivitiesResponse.activities
      .map((activity) => {
        const { date, status, object, context } = activity
        return `Date: ${date}\nStatus: ${status}\nType: ${
          object.type
        }\nStep ID: ${context.step_id ?? 'N/A'}`
      })
      .join('\n\n')

    const stakeholder = 'Clinician'
    const additionalInstructions =
      'Summarize the care flow activities, ensuring they are in chronological order.'

    // Call the function with the mocked data
    const summary = await summarizeCareFlowWithLLM({
      ChatModelGPT4o: ChatModelGPT4oMock,
      careFlowActivities: careFlowData,
      stakeholder,
      additionalInstructions,
    })

    console.log('Summary', summary)

    // Check that the returned summary is as expected
    expect(summary).toBe(mockedSummary)
    expect(ChatModelGPT4oMock.invoke).toHaveBeenCalledTimes(1)
  })
})

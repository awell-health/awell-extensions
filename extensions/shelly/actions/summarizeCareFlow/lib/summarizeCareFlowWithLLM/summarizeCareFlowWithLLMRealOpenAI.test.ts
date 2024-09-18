import 'dotenv/config';
import { summarizeCareFlowWithLLM } from './summarizeCareFlowWithLLM';
import { ChatOpenAI } from '@langchain/openai';
import { mockPathwayActivitiesResponse } from '../../__mocks__/pathwayActivitiesResponse';

// Set timeout to 20 seconds for all tests in this file to handle API call delays
jest.setTimeout(20000);

// OpenAI API settings
const settings = {
  openAiApiKey: process.env.OPENAI_TEST_KEY,
};

// Create a new instance of the OpenAI chat model
const ChatModelGPT4o = new ChatOpenAI({
  openAIApiKey: settings.openAiApiKey,
  modelName: 'gpt-4',
});

describe('summarizeCareFlowWithLLM - Real API Call', () => {
  it('should generate a summary for the mocked care flow activities', async () => {
    const careFlowData = mockPathwayActivitiesResponse.activities
      .map((activity) => {
        const { date, status, object, context } = activity;
        return `Date: ${new Date(date).toLocaleString()}\nStatus: ${status}\nType: ${object.type}\nStep ID: ${context.step_id ?? 'N/A'}`;
      })
      .join('\n\n');

    const stakeholder = 'Clinician';
    const additionalInstructions = 'Summarize the care flow activities, ensuring they are in chronological order.';

    // Call the function with real OpenAI model and mocked care flow data
    const summary = await summarizeCareFlowWithLLM({
      ChatModelGPT4o,
      care_flow_data: careFlowData,
      stakeholder,
      additional_instructions: additionalInstructions,
    });

    // Logging the summary for review
    console.log('Generated Care Flow Summary:', summary);

    // Assertions to verify the summary's content
    expect(summary).toBeDefined();
    expect(typeof summary).toBe('string');
    expect(summary).toContain('pathway');
    expect(summary).toContain('track');
    expect(summary).toContain('plugin');
  });
});

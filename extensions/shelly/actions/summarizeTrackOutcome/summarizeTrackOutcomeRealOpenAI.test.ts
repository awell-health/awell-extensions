import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { summarizeTrackOutcome } from '.'
import { DISCLAIMER_MSG } from '../../lib/constants'
import { mockPathwayDetails } from './__mocks__/mockPathwayDetails'
import { mockTrackData } from './__mocks__/mockTrackData'

// Mock getTrackData to return test data
jest.mock('../../lib/getTrackData/index', () => {
  const actual = jest.requireActual('../../lib/getTrackData/index')
  return {
    ...actual,
    getTrackData: jest.fn()
  }
})

jest.setTimeout(30000) // Increase timeout for real LLM calls

// Use describe.skip to prevent this test from running in normal CI/CD pipelines
// Remove .skip when you want to run this test locally with a real OpenAI API key
describe.skip('summarizeTrackOutcome - Real LLM calls with mocked Awell SDK', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeTrackOutcome)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    const { getTrackData } = require('../../lib/getTrackData/index')
    getTrackData.mockResolvedValue(mockTrackData)
    
    // Set up OpenAI config with the API key from environment variables
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 3,
      timeout: 10000
    })
  })

  it('Should call the real OpenAI model to summarize track outcome', async () => {
    // Create a payload with OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    // Warning if API key doesn't start with sk-
    if (!apiKey.startsWith('sk-')) {
      console.warn('Warning: OpenAI API key does not start with "sk-". This may cause authentication issues.');
    }
    
    const basePayload = {
      settings: {
        openAiApiKey: apiKey,
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
        instructions: 'Summarize this patient interaction track, focusing on the patient request and provider response.'
      },
      patient: {
        id: 'test-patient-id'
      }
    }

    // Mock the Awell SDK to return pathway details
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue(mockPathwayDetails)
      },
    }
    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    try {
      // Call the extension action
      await extensionAction.onEvent({
        payload: basePayload,
        onComplete,
        onError,
        helpers,
      })

      // Verify that onComplete was called with a summary
      expect(onComplete).toHaveBeenCalled()
      
      // Get the summary from the onComplete call
      const summary = onComplete.mock.calls[0][0].data_points.outcomeSummary
      
      // Verify the summary contains the disclaimer
      expect(summary).toContain('Important Notice: The content provided is an AI-generated summary')
      
      // Verify the summary contains relevant information about the track
      // These are key terms that should appear in any reasonable summary of our mock data
      expect(summary.toLowerCase()).toMatch(/medication|prescription|refill|lisinopril|blood pressure/i)
      
      // Verify no errors occurred
      expect(onError).not.toHaveBeenCalled()
    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  })
}) 
/* eslint-disable @typescript-eslint/no-var-requires */

import { TestHelpers } from '@awell-health/extensions-core'
import { summarizeForm } from '.'
import { mockFormDefinitionResponse } from './__mocks__/formDefinitionResponse'
import { mockFormResponseResponse } from './__mocks__/formResponseResponse'
import { markdownToHtml } from '../../../../src/utils'

// Mock getCareFlowDetails
jest.mock('../../lib/getCareFlowDetails', () => ({
  getCareFlowDetails: jest.fn().mockResolvedValue({
    title: 'Test Care Flow',
    id: 'whatever',
    version: 3,
  }),
}))

// Mock the detectLanguageWithLLM function
jest.mock('../../lib/detectLanguageWithLLM', () => ({
  detectLanguageWithLLM: jest.fn().mockImplementation(async () => 'English'),
}))

// Simple payload generator function to replace the external import
const generateTestPayload = (overrides = {}) => {
  return {
    pathway: {
      id: 'test-pathway-id',
      definition_id: 'test-definition-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id',
    },
    activity: {
      id: 'test-activity-id',
    },
    fields: {},
    settings: {},
    patient: {
      id: 'test-patient-id',
    },
    ...overrides,
  }
}

// Mock the OpenAI modules
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      invoke: jest.fn().mockResolvedValue({
        content:
          'The patient reported good overall health. They experienced fatigue and headache in the last 7 days. Additionally, they mentioned occasional dizziness when standing up too quickly.',
      }),
    },
    metadata: {
      activity_id: 'X74HeDQ4N0gtdaSEuzF8s',
      care_flow_id: 'ai4rZaYEocjB',
      care_flow_definition_id: 'whatever',
    },
  }),
}))

jest.mock('../../lib/summarizeFormWithLLM', () => ({
  summarizeFormWithLLM: jest
    .fn()
    .mockImplementation(({ disclaimerMessage, additionalInstructions }) => {
      return Promise.resolve(
        'The patient reported good overall health. They experienced fatigue and headache in the last 7 days. Additionally, they mentioned occasional dizziness when standing up too quickly.',
      )
    }),
}))

describe('summarizeForm - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    const mockQuery = jest
      .fn()
      // First query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
        },
      })
      // Second query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [
            {
              id: 'X74HeDQ4N0gtdaSEuzF8s',
              status: 'DONE',
              date: '2024-09-11T22:56:58.607Z',
              object: {
                id: 'OGhjJKF5LRmo',
                name: 'Test Form',
                type: 'FORM',
              },
              context: {
                step_id: 'Xkn5dkyPA5uW',
              },
            },
          ],
        },
      })
      // Third query: get form definition
      .mockResolvedValueOnce({
        form: mockFormDefinitionResponse,
      })
      // Fourth query: get form response
      .mockResolvedValueOnce({
        formResponse: mockFormResponseResponse,
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery,
      },
    })
  })

  it('Should summarize form with LLM', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Default',
      },
      settings: {},
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify the summarizeFormWithLLM function was called with the correct disclaimer
    const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')
    const { detectLanguageWithLLM } = require('../../lib/detectLanguageWithLLM')

    // Verify language detection was called
    expect(detectLanguageWithLLM).toHaveBeenCalled()

    expect(summarizeFormWithLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        disclaimerMessage:
          '**Important Notice:** The content provided is an AI-generated summary of form responses of version 3 of Care Flow "Test Care Flow" (ID: ai4rZaYEocjB).',
        language: 'English', // Should be the detected language
      }),
    )

    const expected = await markdownToHtml(
      'The patient reported good overall health. They experienced fatigue and headache in the last 7 days. Additionally, they mentioned occasional dizziness when standing up too quickly.',
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('Should NOT use language detection when specific language is provided', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Spanish', // Specific language
        additionalInstructions: 'Focus on medication details and side effects.',
      },
      settings: {},
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Get references to mocked functions
    const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')
    const { detectLanguageWithLLM } = require('../../lib/detectLanguageWithLLM')

    // Verify language detection was NOT called
    expect(detectLanguageWithLLM).not.toHaveBeenCalled()

    // Verify summarizeFormWithLLM was called with the provided language
    expect(summarizeFormWithLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        disclaimerMessage:
          '**Important Notice:** The content provided is an AI-generated summary of form responses of version 3 of Care Flow "Test Care Flow" (ID: ai4rZaYEocjB).',
        language: 'Spanish',
        additionalInstructions: 'Focus on medication details and side effects.',
      }),
    )

    const expected = await markdownToHtml(
      'The patient reported good overall health. They experienced fatigue and headache in the last 7 days. Additionally, they mentioned occasional dizziness when standing up too quickly.',
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

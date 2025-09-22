/* eslint-disable @typescript-eslint/no-var-requires */

import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeFormsInStep } from '.'
import { mockMultipleFormsPathwayActivitiesResponse } from './__mocks__/multipleFormsPathwayActivitiesResponse'
import {
  mockMultipleFormsDefinitionResponse1,
  mockMultipleFormsDefinitionResponse2,
} from './__mocks__/multipleFormsDefinitionResponse'
import {
  mockMultipleFormsResponseResponse1,
  mockMultipleFormsResponseResponse2,
} from './__mocks__/multipleFormsResponsesResponse'

// Mock the detectLanguageWithLLM function
jest.mock('../../lib/detectLanguageWithLLM', () => ({
  detectLanguageWithLLM: jest.fn().mockImplementation(async () => 'English'),
}))

// Mock the OpenAI modules
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      invoke: jest.fn().mockResolvedValue({
        content:
          'Summary of multiple forms: Form 1 shows patient reported good health. Form 2 indicates normal vital signs.',
      }),
    },
    metadata: {
      activity_id: 'X74HeDQ4N0gtdaSEuzF8s',
      care_flow_id: 'ai4rZaYEocjB',
      care_flow_definition_id: 'whatever',
      tenant_id: 'test-tenant-id',
    },
  }),
}))

describe('summarizeFormsInStep - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeFormsInStep)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    const mockQuery = jest
      .fn()
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: mockMultipleFormsPathwayActivitiesResponse.activities[0],
        },
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities:
            mockMultipleFormsPathwayActivitiesResponse.activities.filter(
              (activity) => activity.object.type === 'FORM',
            ),
        },
      })
      .mockResolvedValueOnce({
        form: mockMultipleFormsDefinitionResponse1,
      })
      .mockResolvedValueOnce({
        form: mockMultipleFormsDefinitionResponse2,
      })
      .mockResolvedValueOnce({
        formResponse: mockMultipleFormsResponseResponse1,
      })
      .mockResolvedValueOnce({
        formResponse: mockMultipleFormsResponseResponse2,
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery,
      },
    })
  })

  it('Should summarize multiple forms with mocked OpenAI', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
        tenant_id: 'test-tenant-id',
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

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining('Summary of multiple forms'),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should use language detection when language is Default', async () => {
    // Import the detectLanguageWithLLM function to spy on it
    const { detectLanguageWithLLM } = require('../../lib/detectLanguageWithLLM')

    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
        tenant_id: 'test-tenant-id',
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

    // Verify detectLanguageWithLLM was called
    expect(detectLanguageWithLLM).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.any(String),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should NOT use language detection when specific language is provided', async () => {
    // Import the detectLanguageWithLLM function to spy on it
    const { detectLanguageWithLLM } = require('../../lib/detectLanguageWithLLM')

    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
        tenant_id: 'test-tenant-id',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Spanish', // Specific language
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

    // Verify detectLanguageWithLLM was NOT called
    expect(detectLanguageWithLLM).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.any(String),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})

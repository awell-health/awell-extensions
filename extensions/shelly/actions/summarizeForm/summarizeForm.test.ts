/* eslint-disable @typescript-eslint/no-var-requires */

import { TestHelpers } from '@awell-health/extensions-core'
import { summarizeForm } from '.'
import { mockFormDefinitionResponse } from './__mocks__/formDefinitionResponse'
import { mockFormResponseResponse } from './__mocks__/formResponseResponse'
import { markdownToHtml } from '../../../../src/utils'

// Simple payload generator function to replace the external import
const generateTestPayload = (overrides = {}) => {
  return {
    pathway: {
      id: 'test-pathway-id',
      definition_id: 'test-definition-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    },
    activity: {
      id: 'test-activity-id'
    },
    fields: {},
    settings: {},
    patient: {
      id: 'test-patient-id'
    },
    ...overrides
  }
}

// Mock the OpenAI modules
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      invoke: jest.fn().mockResolvedValue({
        content: 'The patient reported good overall health. They experienced fatigue and headache in the last 7 days. Additionally, they mentioned occasional dizziness when standing up too quickly.',
      }),
    },
    metadata: {
      activity_id: 'X74HeDQ4N0gtdaSEuzF8s',
      care_flow_id: 'ai4rZaYEocjB',
      care_flow_definition_id: 'whatever',
    },
  }),
}))

// Mock the summarizeFormWithLLM function to handle the new disclaimerMessage parameter
jest.mock('../../lib/summarizeFormWithLLM', () => ({
  summarizeFormWithLLM: jest.fn().mockImplementation(({ disclaimerMessage }) => {
    return Promise.resolve('The patient reported good overall health. They experienced fatigue and headache in the last 7 days. Additionally, they mentioned occasional dizziness when standing up too quickly.')
  }),
}))

describe('summarizeForm - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

  // Define mock pathway details for the disclaimer
  const mockPathwayDetails = {
    pathway: {
      success: true,
      code: 200,
      pathway: {
        id: 'ai4rZaYEocjB',
        title: 'Test Care Flow',
        pathway_definition_id: 'whatever',
      }
    }
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    const mockQuery = jest.fn()
      // First query: get pathway details for disclaimer
      .mockResolvedValueOnce(mockPathwayDetails)
      // Second query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }
        }
      })
      // Third query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [{
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            status: 'DONE',
            date: '2024-09-11T22:56:58.607Z',
            object: {
              id: 'OGhjJKF5LRmo',
              name: 'Test Form',
              type: 'FORM'
            },
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }]
        }
      })
      // Fourth query: get form definition
      .mockResolvedValueOnce({
        form: mockFormDefinitionResponse,
      })
      // Fifth query: get form response
      .mockResolvedValueOnce({
        formResponse: mockFormResponseResponse,
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery
      }
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
    })

    const expected = await markdownToHtml('The patient reported good overall health. They experienced fatigue and headache in the last 7 days. Additionally, they mentioned occasional dizziness when standing up too quickly.')
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

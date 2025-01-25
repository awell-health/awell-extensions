/* eslint-disable @typescript-eslint/no-var-requires */

import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeFormsInStep } from '.'
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'
import { mockMultipleFormsPathwayActivitiesResponse } from './__mocks__/multipleFormsPathwayActivitiesResponse'
import {
  mockMultipleFormsDefinitionResponse1,
  mockMultipleFormsDefinitionResponse2,
} from './__mocks__/multipleFormsDefinitionResponse'
import {
  mockMultipleFormsResponseResponse1,
  mockMultipleFormsResponseResponse2,
} from './__mocks__/multipleFormsResponsesResponse'

// Mock the OpenAI modules
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      invoke: jest.fn().mockResolvedValue({
        content: 'Summary of multiple forms: Form 1 shows patient reported good health. Form 2 indicates normal vital signs.',
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
    const mockQuery = jest.fn()
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: mockMultipleFormsPathwayActivitiesResponse.activities[0]
        }
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: mockMultipleFormsPathwayActivitiesResponse.activities.filter(
            activity => activity.object.type === 'FORM'
          )
        }
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
        query: mockQuery
      }
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
    })

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining('Summary of multiple forms'),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})

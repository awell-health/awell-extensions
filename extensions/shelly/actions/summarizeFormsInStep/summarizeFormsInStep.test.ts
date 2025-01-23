/* eslint-disable @typescript-eslint/no-var-requires */

import 'dotenv/config'
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

describe('summarizeFormsInStep - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeFormsInStep)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 3,
      timeout: 10000
    })
  })

  it('Should summarize multiple forms with mocked OpenAI', async () => {
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
      settings: {}
    })

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
          activities: mockMultipleFormsPathwayActivitiesResponse.activities
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

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(6)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(DISCLAIMER_MSG_FORM)
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)
})

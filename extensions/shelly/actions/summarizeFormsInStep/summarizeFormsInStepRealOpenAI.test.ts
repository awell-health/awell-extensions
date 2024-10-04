/* eslint-disable @typescript-eslint/no-var-requires */

import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeFormsInStep } from '.'
import { mockMultipleFormsPathwayActivitiesResponse } from './__mocks__/multipleFormsPathwayActivitiesResponse'
import { mockMultipleFormsDefinitionResponse1, mockMultipleFormsDefinitionResponse2 } from './__mocks__/multipleFormsDefinitionResponse'
import { mockMultipleFormsResponseResponse1, mockMultipleFormsResponseResponse2 } from './__mocks__/multipleFormsResponsesResponse'
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'

describe('summarizeFormsInStep - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeFormsInStep)

  beforeEach(() => {
    clearMocks()
  })

  it('Should summarize multiple forms with real OpenAI', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      patient: { id: 'whatever' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Default',
      },
      settings: {
        openAiApiKey: process.env.OPENAI_API_KEY,
      },
    })

    // Mock the Awell SDK
    const awellSdkMock = {
      orchestration: {
        mutation: jest.fn().mockResolvedValue({}),
        query: jest
          .fn()
          .mockResolvedValueOnce({
            pathwayActivities: mockMultipleFormsPathwayActivitiesResponse,
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
          }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    const completionResult = onComplete.mock.calls[0][0]
    expect(completionResult).toHaveProperty('data_points.summary')
    expect(completionResult.data_points.summary).toContain(DISCLAIMER_MSG_FORM)
    expect(completionResult.data_points.summary.length).toBeGreaterThan(DISCLAIMER_MSG_FORM.length + 50)
  }, 30000) // Increase timeout to 30 seconds for API call

  it('Should summarize multiple forms with real OpenAI using Text Paragraph format in French', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      patient: { id: 'whatever' },
      fields: {
        summaryFormat: 'Text paragraph',
        language: 'French',
      },
      settings: {
        openAiApiKey: process.env.OPENAI_API_KEY,
      },
    })

    // Mock the Awell SDK
    const awellSdkMock = {
      orchestration: {
        mutation: jest.fn().mockResolvedValue({}),
        query: jest
          .fn()
          .mockResolvedValueOnce({
            pathwayActivities: mockMultipleFormsPathwayActivitiesResponse,
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
          }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    const completionResult = onComplete.mock.calls[0][0]
    expect(completionResult).toHaveProperty('data_points.summary')
    expect(completionResult.data_points.summary).toContain('Avis Important')
    expect(completionResult.data_points.summary.length).toBeGreaterThan(DISCLAIMER_MSG_FORM.length + 50)
    
    // Check if the summary is in French
    expect(completionResult.data_points.summary).toMatch(/téléphone/)
    
    // Check if it's a paragraph (no bullet points)
    expect(completionResult.data_points.summary).not.toMatch(/^[•]/m)
  }, 30000) // Increase timeout to 30 seconds for API call
})

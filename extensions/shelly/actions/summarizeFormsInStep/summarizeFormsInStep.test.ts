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
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'
import { markdownToHtml } from '../../../../src/utils'

// Import ChatOpenAI after mocking
import { ChatOpenAI } from '@langchain/openai'

// Mock the '@langchain/openai' module
jest.mock('@langchain/openai', () => {
  const mockInvoke = jest.fn().mockResolvedValue({
    content: 'Mocked summary from LLM',
  })

  const mockChatOpenAI = jest.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  }))

  return {
    ChatOpenAI: mockChatOpenAI,
  }
})

describe('summarizeFormsInStep - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeFormsInStep)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('Should summarize multiple forms with LLM', async () => {
    const summarizeFormWithLLMSpy = jest.spyOn(
      require('../../lib/summarizeFormWithLLM/summarizeFormWithLLM'),
      'summarizeFormWithLLM'
    )

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
        openAiApiKey: 'a',
      },
    })

    // Mock the Awell SDK
    const awellSdkMock = {
      orchestration: {
        mutation: jest.fn().mockResolvedValue({}),
        query: jest
          .fn()
          .mockResolvedValueOnce({
            activity: {
              activity:
                mockMultipleFormsPathwayActivitiesResponse.activities[0],
              success: true,
            },
          })
          .mockResolvedValueOnce({
            pathwayStepActivities: mockMultipleFormsPathwayActivitiesResponse,
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

    expect(ChatOpenAI).toHaveBeenCalled()
    expect(summarizeFormWithLLMSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ChatModelGPT4o: expect.any(Object),
        formData: expect.any(String),
        summaryFormat: 'Bullet-points',
        language: 'Default',
        disclaimerMessage: expect.any(String),
      })
    )

    const expected = await markdownToHtml('Mocked summary from LLM')

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

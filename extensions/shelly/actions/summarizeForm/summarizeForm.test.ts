/* eslint-disable @typescript-eslint/no-var-requires */

import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeForm } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { mockFormDefinitionResponse } from './__mocks__/formDefinitionResponse'
import { mockFormResponseResponse } from './__mocks__/formResponseResponse'
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

describe('summarizeForm - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('Should summarize form with LLM', async () => {
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
            pathwayActivities: mockPathwayActivitiesResponse,
          })
          .mockResolvedValueOnce({
            form: mockFormDefinitionResponse,
          })
          .mockResolvedValueOnce({
            formResponse: mockFormResponseResponse,
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
    expect(summarizeFormWithLLMSpy).toHaveBeenCalledWith({
      ChatModelGPT4o: expect.any(Object),
      formData: expect.any(String),
      summaryFormat: 'Bullet-points',
      language: 'Default',
    })

    const expected = await markdownToHtml(`${DISCLAIMER_MSG_FORM}\n\nMocked summary from LLM`)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})

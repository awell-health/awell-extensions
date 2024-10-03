import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeForm } from '.'
import { mockFormDefinitionResponse } from './__mocks__/formDefinitionResponse'
import { mockFormResponseResponse } from './__mocks__/formResponseResponse'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'

describe('summarizeForm - Real LLM calls with mocked Awell SDK', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('Should call the real model and use mocked form data with Bullet-points format', async () => {
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
        openAiApiKey: process.env.OPENAI_TEST_KEY,
      },
    })

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

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(3)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringMatching(new RegExp(`${DISCLAIMER_MSG_FORM}.*General Dummy Form.*-`, 's')),
      },
    })

    const summary = onComplete.mock.calls[0][0].data_points.summary
    expect(summary).toMatch(/General Dummy Form/)
    expect(summary).toMatch(/-/)
    expect(summary.split('\n').filter((line: string) => line.trim().startsWith('')).length).toBeGreaterThan(1)

    expect(onError).not.toHaveBeenCalled()
  })

  it('Should call the real model and use mocked form data with Text paragraph format', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      patient: { id: 'whatever' },
      fields: {
        summaryFormat: 'Text paragraph',
        language: 'Default',
      },
      settings: {
        openAiApiKey: process.env.OPENAI_TEST_KEY,
      },
    })

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

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(3)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringMatching(new RegExp(`${DISCLAIMER_MSG_FORM}.*General Dummy Form.*`, 's')),
      },
    })

    const summary = onComplete.mock.calls[0][0].data_points.summary
    expect(summary).toMatch(/General Dummy Form/)
    expect(summary.split('\n').length).toBeLessThan(10)  // Assuming a paragraph is typically less than 5 lines and givign summe buffer for the title and disclaimer

    expect(onError).not.toHaveBeenCalled()
  })
})

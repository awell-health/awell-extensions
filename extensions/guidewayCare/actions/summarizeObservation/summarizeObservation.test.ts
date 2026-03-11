import { TestHelpers } from '@awell-health/extensions-core'
import axios from 'axios'
import { summarizeObservation as action } from './summarizeObservation'

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios')
  return {
    ...actual,
    post: jest.fn(),
    isAxiosError: jest.fn((e: unknown) =>
      Boolean(
        e &&
          typeof e === 'object' &&
          (e as { isAxiosError?: boolean }).isAxiosError === true,
      ),
    ),
  }
})
const mockedAxios = axios as jest.Mocked<typeof axios>

const MOCK_RESPONSE = {
  data: {
    status: 'success' as const,
    data: {
      care_flow_id: undefined,
      source_id: 'src-abc123',
      processedAt: '2026-03-11T12:00:00Z',
      processingTimeMs: 1234,
      prompt_version: 3,
      analysis: {
        summary: 'Patient reported feeling good overall.',
        observations_summary_formatted: '<p>Overall Feeling: Good</p>',
        followup_formatted: '<ul><li>Schedule follow-up in 2 weeks</li></ul>',
        observations: [{ category: 'Overall Feeling', value: 'Good' }],
      },
      tokenUsage: {
        promptTokens: 100,
        completionTokens: 400,
        totalTokens: 500,
        estimatedCost: 0.0025,
      },
    },
  },
}

const BASE_PAYLOAD = {
  fields: {
    sourceText: 'Patient called and said they feel good.',
    careFlowId: undefined,
    processedDatetime: undefined,
    sourceType: undefined,
    sourceId: undefined,
    context: undefined,
  },
  settings: {
    apiKey: 'test-api-key',
  },
}

describe('Guideway Care - Summarize Observation', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      mockedAxios.post.mockResolvedValueOnce(MOCK_RESPONSE)
    })

    test('Should call onComplete with mapped data points', async () => {
      await extensionAction.onEvent({
        payload: BASE_PAYLOAD as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      const inner = MOCK_RESPONSE.data.data
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          summary: inner.analysis.summary,
          observationsSummaryFormatted:
            inner.analysis.observations_summary_formatted,
          followupFormatted: inner.analysis.followup_formatted,
          observations: JSON.stringify(inner.analysis.observations),
          sourceId: inner.source_id,
          processedAt: inner.processedAt,
          processingTimeMs: String(inner.processingTimeMs),
          promptVersion: String(inner.prompt_version),
          totalTokens: String(inner.tokenUsage.totalTokens),
          estimatedCost: String(inner.tokenUsage.estimatedCost),
        },
      })
    })
  })

  describe('When API returns 401', () => {
    beforeEach(() => {
      const error = Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: 401, data: {} },
      })
      mockedAxios.post.mockRejectedValueOnce(error)
    })

    test('Should call onError with auth message', async () => {
      await extensionAction.onEvent({
        payload: BASE_PAYLOAD as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          expect.objectContaining({
            text: { en: 'Invalid or missing API key (401)' },
          }),
        ]),
      })
    })
  })

  describe('When API returns 400', () => {
    beforeEach(() => {
      const error = Object.assign(new Error('Bad Request'), {
        isAxiosError: true,
        response: { status: 400, data: { message: 'source_text is required' } },
      })
      mockedAxios.post.mockRejectedValueOnce(error)
    })

    test('Should call onError with server message', async () => {
      await extensionAction.onEvent({
        payload: BASE_PAYLOAD as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          expect.objectContaining({
            text: { en: 'source_text is required' },
          }),
        ]),
      })
    })
  })
})

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

/**
 * Helper to build a mockQuery for Step-scoped tests (getLatestFormInCurrentStep).
 * Returns queries for: activity → stepActivities → formDefinition → formResponse
 */
const buildStepMockQuery = () =>
  jest
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

/**
 * Helper to build a mockQuery for Step + All (getAllFormsInCurrentStep).
 *
 * NOTE: Promise.all causes interleaved query ordering — all definition queries
 * fire before any response queries, so mock order is:
 * activity → stepActivities → formDef1 → formDef2 → formResp1 → formResp2
 */
const buildStepAllMockQuery = () =>
  jest
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
    // Second query: get activities in current step (two forms)
    .mockResolvedValueOnce({
      pathwayStepActivities: {
        success: true,
        activities: [
          {
            id: 'form-activity-1',
            status: 'DONE',
            date: '2024-09-11T22:55:00.000Z',
            object: {
              id: 'form-1',
              name: 'Form A',
              type: 'FORM',
            },
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
          {
            id: 'form-activity-2',
            status: 'DONE',
            date: '2024-09-11T22:56:00.000Z',
            object: {
              id: 'form-2',
              name: 'Form B',
              type: 'FORM',
            },
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
        ],
      },
    })
    // All form definitions fire first (Promise.all interleaving)
    .mockResolvedValueOnce({ form: mockFormDefinitionResponse })
    .mockResolvedValueOnce({ form: mockFormDefinitionResponse })
    // Then all form responses
    .mockResolvedValueOnce({ formResponse: mockFormResponseResponse })
    .mockResolvedValueOnce({ formResponse: mockFormResponseResponse })

/**
 * Helper to build a mockQuery for Track-scoped tests (getFormsInTrack).
 *
 * NOTE: Promise.all causes interleaved query ordering — all definition queries
 * fire before any response queries, so mock order is:
 * activity → pathwayActivities → formDef1 → ... → formDefN → formResp1 → ... → formRespN
 */
const buildTrackMockQuery = (formCount: number) => {
  const mock = jest.fn()

  // First query: get current activity (to find track_id)
  mock.mockResolvedValueOnce({
    activity: {
      success: true,
      activity: {
        id: 'X74HeDQ4N0gtdaSEuzF8s',
        date: '2024-09-11T22:56:59.607Z',
        context: {
          track_id: 'track-1',
        },
      },
    },
  })

  // Second query: get all activities in track
  const activities = Array.from({ length: formCount }, (_, i) => ({
    id: `form-activity-${i + 1}`,
    status: 'DONE',
    date: `2024-09-11T22:5${i}:00.000Z`,
    object: {
      id: `form-${i + 1}`,
      name: `Track Form ${i + 1}`,
      type: 'FORM',
    },
  }))

  mock.mockResolvedValueOnce({
    pathwayActivities: {
      success: true,
      activities,
    },
  })

  // All form definitions fire first (Promise.all interleaving)
  for (let i = 0; i < formCount; i++) {
    mock.mockResolvedValueOnce({ form: mockFormDefinitionResponse })
  }
  // Then all form responses
  for (let i = 0; i < formCount; i++) {
    mock.mockResolvedValueOnce({ formResponse: mockFormResponseResponse })
  }

  return mock
}

/**
 * Helper to build a Track mockQuery that returns zero forms.
 */
const buildTrackEmptyMockQuery = () => {
  const mock = jest.fn()

  mock.mockResolvedValueOnce({
    activity: {
      success: true,
      activity: {
        id: 'X74HeDQ4N0gtdaSEuzF8s',
        date: '2024-09-11T22:56:59.607Z',
        context: {
          track_id: 'track-1',
        },
      },
    },
  })

  mock.mockResolvedValueOnce({
    pathwayActivities: {
      success: true,
      activities: [],
    },
  })

  return mock
}

describe('summarizeForm - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  describe('scope=Step, formSelection=Latest (default)', () => {
    beforeEach(() => {
      helpers.awellSdk = jest.fn().mockReturnValue({
        orchestration: { query: buildStepMockQuery() },
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

      const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')
      const { detectLanguageWithLLM } = require('../../lib/detectLanguageWithLLM')

      expect(detectLanguageWithLLM).toHaveBeenCalled()

      expect(summarizeFormWithLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          disclaimerMessage:
            '**Important Notice:** The content provided is an AI-generated summary of form responses of version 3 of Care Flow "Test Care Flow" (ID: ai4rZaYEocjB).',
          language: 'English',
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
          language: 'Spanish',
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

      const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')
      const { detectLanguageWithLLM } = require('../../lib/detectLanguageWithLLM')

      expect(detectLanguageWithLLM).not.toHaveBeenCalled()

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

  describe('scope=Step, formSelection=All', () => {
    beforeEach(() => {
      helpers.awellSdk = jest.fn().mockReturnValue({
        orchestration: { query: buildStepAllMockQuery() },
      })
    })

    it('Should summarize all forms in the step', async () => {
      const payload = generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        fields: {
          scope: 'Step',
          formSelection: 'All',
          summaryFormat: 'Bullet-points',
          language: 'English',
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

      const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')

      // formData should contain text from both forms
      expect(summarizeFormWithLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: expect.stringContaining('Next Form'),
        }),
      )

      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('scope=Track, formSelection=Latest', () => {
    beforeEach(() => {
      helpers.awellSdk = jest.fn().mockReturnValue({
        orchestration: { query: buildTrackMockQuery(2) },
      })
    })

    it('Should summarize only the latest form in the track', async () => {
      const payload = generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        fields: {
          scope: 'Track',
          formSelection: 'Latest',
          summaryFormat: 'Text paragraph',
          language: 'English',
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

      const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')

      // Should summarize a single form (no "Next Form" separator)
      expect(summarizeFormWithLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: expect.not.stringContaining('Next Form'),
        }),
      )

      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('scope=Track, formSelection=All', () => {
    beforeEach(() => {
      helpers.awellSdk = jest.fn().mockReturnValue({
        orchestration: { query: buildTrackMockQuery(3) },
      })
    })

    it('Should summarize all forms in the track', async () => {
      const payload = generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        fields: {
          scope: 'Track',
          formSelection: 'All',
          summaryFormat: 'Bullet-points',
          language: 'English',
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

      const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')

      // formData should contain text from multiple forms
      expect(summarizeFormWithLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: expect.stringContaining('Next Form'),
        }),
      )

      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('no forms found', () => {
    beforeEach(() => {
      helpers.awellSdk = jest.fn().mockReturnValue({
        orchestration: { query: buildTrackEmptyMockQuery() },
      })
    })

    it('Should call onError when no forms are found in the track', async () => {
      const payload = generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        fields: {
          scope: 'Track',
          formSelection: 'Latest',
          language: 'English',
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

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              text: { en: 'No completed form found in the current track' },
            }),
          ]),
        }),
      )

      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})

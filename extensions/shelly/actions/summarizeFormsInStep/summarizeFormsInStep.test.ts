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

jest.mock('../../lib/summarizeFormWithLLM', () => ({
  summarizeFormWithLLM: jest
    .fn()
    .mockResolvedValue(
      'Summary of multiple forms: Form 1 shows patient reported good health. Form 2 indicates normal vital signs.',
    ),
}))

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

  it('Should pass custom disclaimer text and bottom placement to LLM', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
        tenant_id: 'test-tenant-id',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'English',
        disclaimerText: 'Custom forms-in-step disclaimer.',
        disclaimerPlacement: 'bottom',
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

    expect(summarizeFormWithLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        disclaimerMessage: 'Custom forms-in-step disclaimer.',
        disclaimerPlacement: 'bottom',
      }),
    )
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should use tenant disclaimer settings when action fields are absent', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
        tenant_id: 'test-tenant-id',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'English',
      },
      settings: {
        disclaimerText: 'Tenant forms-in-step disclaimer.',
        disclaimerPlacement: 'bottom',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')

    expect(summarizeFormWithLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        disclaimerMessage: 'Tenant forms-in-step disclaimer.',
        disclaimerPlacement: 'bottom',
      }),
    )
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should let action disclaimer settings override tenant disclaimer settings', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
        tenant_id: 'test-tenant-id',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'English',
        disclaimerText: 'Action forms-in-step disclaimer.',
        disclaimerPlacement: 'top',
      },
      settings: {
        disclaimerText: 'Tenant forms-in-step disclaimer.',
        disclaimerPlacement: 'bottom',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')

    expect(summarizeFormWithLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        disclaimerMessage: 'Action forms-in-step disclaimer.',
        disclaimerPlacement: 'top',
      }),
    )
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should let action disclaimer text override tenant text while tenant placement is used', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
        tenant_id: 'test-tenant-id',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'English',
        disclaimerText: 'Action forms-in-step disclaimer.',
      },
      settings: {
        disclaimerText: 'Tenant forms-in-step disclaimer.',
        disclaimerPlacement: 'bottom',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')

    expect(summarizeFormWithLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        disclaimerMessage: 'Action forms-in-step disclaimer.',
        disclaimerPlacement: 'bottom',
      }),
    )
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should let action disclaimer placement override tenant placement while tenant text is used', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
        tenant_id: 'test-tenant-id',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'English',
        disclaimerPlacement: 'top',
      },
      settings: {
        disclaimerText: 'Tenant forms-in-step disclaimer.',
        disclaimerPlacement: 'bottom',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')

    expect(summarizeFormWithLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        disclaimerMessage: 'Tenant forms-in-step disclaimer.',
        disclaimerPlacement: 'top',
      }),
    )
    expect(onError).not.toHaveBeenCalled()
  })

  it.each([
    ['empty string', ''],
    ['null', null],
    ['whitespace only', '   '],
  ])(
    'Should fall back to the default form disclaimer when tenant disclaimerText is %s',
    async (_label, tenantDisclaimerText) => {
      const payload = generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
          tenant_id: 'test-tenant-id',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        fields: {
          summaryFormat: 'Bullet-points',
          language: 'English',
        },
        settings: {
          disclaimerText: tenantDisclaimerText as string | undefined,
          disclaimerPlacement: 'bottom',
        },
      })

      await extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')
      const { DISCLAIMER_MSG_FORM } = require('../../lib/constants')

      expect(summarizeFormWithLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          disclaimerMessage: DISCLAIMER_MSG_FORM,
          disclaimerPlacement: 'bottom',
        }),
      )
      expect(onError).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['capitalized', 'Top', 'top'],
    ['uppercase', 'BOTTOM', 'bottom'],
    ['trailing whitespace', 'top ', 'top'],
    ['surrounding whitespace', ' bottom ', 'bottom'],
  ])(
    'Should normalize tenant disclaimerPlacement %s to %s',
    async (_label, tenantDisclaimerPlacement, expectedPlacement) => {
      const payload = generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
          tenant_id: 'test-tenant-id',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        fields: {
          summaryFormat: 'Bullet-points',
          language: 'English',
        },
        settings: {
          disclaimerText: 'Tenant forms-in-step disclaimer.',
          disclaimerPlacement: tenantDisclaimerPlacement,
        },
      })

      await extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      const { summarizeFormWithLLM } = require('../../lib/summarizeFormWithLLM')

      expect(summarizeFormWithLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          disclaimerMessage: 'Tenant forms-in-step disclaimer.',
          disclaimerPlacement: expectedPlacement,
        }),
      )
      expect(onError).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['empty string', ''],
    ['null', null],
    ['whitespace only', '   '],
  ])(
    'Should fall back to the default form disclaimer when disclaimerText is %s',
    async (_label, disclaimerText) => {
      const payload = generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
          tenant_id: 'test-tenant-id',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        fields: {
          summaryFormat: 'Bullet-points',
          language: 'English',
          disclaimerText: disclaimerText as string | undefined,
          disclaimerPlacement: 'bottom',
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
      const { DISCLAIMER_MSG_FORM } = require('../../lib/constants')

      expect(summarizeFormWithLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          disclaimerMessage: DISCLAIMER_MSG_FORM,
          disclaimerPlacement: 'bottom',
        }),
      )
      expect(onError).not.toHaveBeenCalled()
    },
  )

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

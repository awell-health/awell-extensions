import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeCareFlow } from '.'
import { mockCareflowActivitiesResponse } from './__mocks__/careflowActivitiesResponse'
import { DISCLAIMER_MSG } from '../../lib/constants'

// Mock createOpenAIModel
jest.mock('../../../../src/lib/llm/openai', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      invoke: jest.fn().mockResolvedValue({
        content: 'Mocked care flow summary from LLM',
      }),
    },
    metadata: {
      traceId: 'test-trace-id',
      care_flow_definition_id: 'whatever',
      care_flow_id: 'ai4rZaYEocjB',
      activity_id: 'test-activity-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id',
    },
  }),
}))

describe('summarizeCareFlow - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeCareFlow)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {}) // Suppress console.error
  })

  it('Should summarize care flow with LLM', async () => {
    const summarizeCareFlowWithLLMSpy = jest.spyOn(
      require('./lib/summarizeCareFlowWithLLM'),
      'summarizeCareFlowWithLLM',
    )

    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Summarize key activities.',
      },
      settings: {
        openAiApiKey: 'test-key',
      },
    })

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          careflowActivities: mockCareflowActivitiesResponse,
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(summarizeCareFlowWithLLMSpy).toHaveBeenCalledWith({
      model: expect.any(Object),
      careFlowActivities: expect.any(String),
      stakeholder: 'Clinician',
      additionalInstructions: 'Summarize key activities.',
      metadata: expect.objectContaining({
        traceId: 'test-trace-id',
        care_flow_definition_id: 'whatever',
        care_flow_id: 'ai4rZaYEocjB',
        activity_id: 'test-activity-id',
      }),
    })

    const expected = `<p>${DISCLAIMER_MSG}</p>
<p>Mocked care flow summary from LLM</p>`

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('Should use custom disclaimer text at the bottom when configured', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Summarize key activities.',
        disclaimerText: 'Custom AI disclaimer.',
        disclaimerPlacement: 'bottom',
      },
      settings: {
        openAiApiKey: 'test-key',
      },
    })

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          careflowActivities: mockCareflowActivitiesResponse,
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const expected = `<p>Mocked care flow summary from LLM</p>
<p>Custom AI disclaimer.</p>`

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('Should use tenant disclaimer text and bottom placement when action fields are absent', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Summarize key activities.',
      },
      settings: {
        disclaimerText: 'Tenant AI disclaimer.',
        disclaimerPlacement: 'bottom',
      },
    })

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          careflowActivities: mockCareflowActivitiesResponse,
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const expected = `<p>Mocked care flow summary from LLM</p>
<p>Tenant AI disclaimer.</p>`

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('Should let action disclaimer settings override tenant disclaimer settings', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Summarize key activities.',
        disclaimerText: 'Action AI disclaimer.',
        disclaimerPlacement: 'top',
      },
      settings: {
        disclaimerText: 'Tenant AI disclaimer.',
        disclaimerPlacement: 'bottom',
      },
    })

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          careflowActivities: mockCareflowActivitiesResponse,
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const expected = `<p>Action AI disclaimer.</p>
<p>Mocked care flow summary from LLM</p>`

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('Should let action disclaimer text override tenant text while tenant placement is used', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Summarize key activities.',
        disclaimerText: 'Action AI disclaimer.',
      },
      settings: {
        openAiApiKey: 'test-key',
        disclaimerText: 'Tenant AI disclaimer.',
        disclaimerPlacement: 'bottom',
      },
    })

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          careflowActivities: mockCareflowActivitiesResponse,
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Action text wins, tenant placement (bottom) wins
    const expected = `<p>Mocked care flow summary from LLM</p>
<p>Action AI disclaimer.</p>`

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('Should let action disclaimer placement override tenant placement while tenant text is used', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: 'Summarize key activities.',
        disclaimerPlacement: 'top',
      },
      settings: {
        openAiApiKey: 'test-key',
        disclaimerText: 'Tenant AI disclaimer.',
        disclaimerPlacement: 'bottom',
      },
    })

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          careflowActivities: mockCareflowActivitiesResponse,
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Tenant text wins (no action text), action placement (top) wins
    const expected = `<p>Tenant AI disclaimer.</p>
<p>Mocked care flow summary from LLM</p>`

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expected,
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it.each([
    ['empty string', ''],
    ['null', null],
    ['whitespace only', '   '],
  ])(
    'Should fall back to the default disclaimer when tenant disclaimerText is %s',
    async (_label, tenantDisclaimerText) => {
      const payload = generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
        },
        fields: {
          stakeholder: 'Clinician',
          additionalInstructions: 'Summarize key activities.',
        },
        settings: {
          openAiApiKey: 'test-key',
          disclaimerText: tenantDisclaimerText as string | undefined,
          disclaimerPlacement: 'bottom',
        },
      })

      const awellSdkMock = {
        orchestration: {
          query: jest.fn().mockResolvedValue({
            careflowActivities: mockCareflowActivitiesResponse,
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      await extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      // Default disclaimer text is used, tenant placement (bottom) is still respected
      const expected = `<p>Mocked care flow summary from LLM</p>
<p>${DISCLAIMER_MSG}</p>`

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          summary: expected,
        },
      })

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
        },
        fields: {
          stakeholder: 'Clinician',
          additionalInstructions: 'Summarize key activities.',
        },
        settings: {
          openAiApiKey: 'test-key',
          disclaimerText: 'Tenant AI disclaimer.',
          disclaimerPlacement: tenantDisclaimerPlacement,
        },
      })

      const awellSdkMock = {
        orchestration: {
          query: jest.fn().mockResolvedValue({
            careflowActivities: mockCareflowActivitiesResponse,
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      await extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      const expected =
        expectedPlacement === 'bottom'
          ? `<p>Mocked care flow summary from LLM</p>\n<p>Tenant AI disclaimer.</p>`
          : `<p>Tenant AI disclaimer.</p>\n<p>Mocked care flow summary from LLM</p>`

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          summary: expected,
        },
      })

      expect(onError).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['empty string', ''],
    ['null', null],
    ['whitespace only', '   '],
  ])(
    'Should fall back to the default disclaimer when disclaimerText is %s',
    async (_label, disclaimerText) => {
      const payload = generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
        },
        fields: {
          stakeholder: 'Clinician',
          additionalInstructions: 'Summarize key activities.',
          disclaimerText: disclaimerText as string | undefined,
          disclaimerPlacement: 'bottom',
        },
        settings: {
          openAiApiKey: 'test-key',
        },
      })

      const awellSdkMock = {
        orchestration: {
          query: jest.fn().mockResolvedValue({
            careflowActivities: mockCareflowActivitiesResponse,
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      await extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      // Default disclaimer is used despite bottom placement being respected.
      const expected = `<p>Mocked care flow summary from LLM</p>
<p>${DISCLAIMER_MSG}</p>`

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          summary: expected,
        },
      })

      expect(onError).not.toHaveBeenCalled()
    },
  )

  it('Should handle errors gracefully', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      fields: {
        stakeholder: 'Clinician',
        additionalInstructions: '',
      },
      settings: {
        openAiApiKey: 'test-key',
      },
    })

    // Mock SDK to throw a specific error
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockRejectedValue(new Error('SDK query failed')),
      },
    }
    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify error handling
    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'SDK query failed' },
          error: {
            category: 'SERVER_ERROR',
            message: 'SDK query failed',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(1)
  })
})

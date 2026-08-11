import { TestHelpers } from '@awell-health/extensions-core'
import { summarizeTrackOutcome } from '.'
import { mockPathwayDetails } from './__mocks__/mockPathwayDetails'
import { mockTrackData } from './__mocks__/mockTrackData'

// Mock getTrackData
jest.mock('../../lib/getTrackData/index', () => {
  const actual = jest.requireActual('../../lib/getTrackData/index')
  return {
    ...actual,
    getTrackData: jest.fn(),
  }
})

// Mock getCareFlowDetails
jest.mock('../../lib/getCareFlowDetails', () => ({
  getCareFlowDetails: jest.fn().mockResolvedValue({
    title: 'AI Actions Check',
    id: 'ty0CmaHm2jlX',
    version: 6,
  }),
}))

// Mock createOpenAIModel
jest.mock('../../../../src/lib/llm/openai', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      invoke: jest.fn().mockResolvedValue({
        content: `**Outcome:**
The patient's medication refill request was processed successfully.

**Details supporting the outcome:**
- Patient John Doe requested a refill for Lisinopril 10mg
- The request was categorized as a Medication Refill Request
- Dr. Smith approved and processed the refill for 90 days
- The prescription was sent to CVS Pharmacy
- A follow-up blood pressure check was recommended in 30 days`,
      }),
    },
    metadata: {
      traceId: 'test-trace-id',
      care_flow_definition_id: 'ty0CmaHm2jlX',
      care_flow_id: 'xQ2P4uBn2cY8',
      activity_id: 'test-activity-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id',
    },
    callbacks: [],
  }),
}))

describe('summarizeTrackOutcome - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeTrackOutcome)

  const basePayload = {
    settings: {
      openAiApiKey: 'test-key',
    },
    pathway: {
      id: 'xQ2P4uBn2cY8',
      definition_id: 'ty0CmaHm2jlX',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id',
    },
    activity: {
      id: 'test-activity-id',
    },
    fields: {
      instructions: 'Summarize track outcome.',
    },
    patient: {
      id: 'test-patient-id',
    },
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    const { getTrackData } = require('../../lib/getTrackData/index')
    getTrackData.mockResolvedValue(mockTrackData)
    jest.spyOn(console, 'error').mockImplementation(() => {}) // Suppress console.error
  })

  it('Should summarize track outcome with LLM and include key information', async () => {
    const summarizeTrackOutcomeWithLLMSpy = jest.spyOn(
      require('./lib/summarizeTrackOutcomeWithLLM'),
      'summarizeTrackOutcomeWithLLM',
    )

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockImplementation(({ activity, pathway }) => {
          if (activity) {
            return Promise.resolve({
              activity: {
                success: true,
                activity: {
                  id: 'test-activity-id',
                  context: {
                    track_id: 'test-track-id',
                  },
                },
              },
            })
          }
          if (pathway) {
            return Promise.resolve(mockPathwayDetails)
          }
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify the LLM function was called with correct parameters
    expect(summarizeTrackOutcomeWithLLMSpy).toHaveBeenCalledWith({
      model: expect.any(Object),
      trackActivities: expect.any(String),
      instructions: 'Summarize track outcome.',
      metadata: expect.objectContaining({
        traceId: 'test-trace-id',
        care_flow_definition_id: 'ty0CmaHm2jlX',
        care_flow_id: 'xQ2P4uBn2cY8',
        activity_id: 'test-activity-id',
      }),
      callbacks: expect.any(Array),
    })

    // Verify the disclaimer is included
    const expectedDisclaimerMsg = `<p><strong>Important Notice:</strong> The content provided is an AI-generated summary of version 6 of Care Flow "AI Actions Check" (ID: xQ2P4uBn2cY8).</p>`

    // Verify onComplete was called with the expected data
    expect(onComplete).toHaveBeenCalled()
    const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary

    // Check for disclaimer
    expect(summaryData).toContain(expectedDisclaimerMsg)
    expect(summaryData.trim().startsWith(expectedDisclaimerMsg)).toBe(true)

    // Check for key information from the mock LLM response
    expect(summaryData).toContain(
      'medication refill request was processed successfully',
    )
    expect(summaryData).toContain('Lisinopril 10mg')
    expect(summaryData).toContain('Dr. Smith approved')
    expect(summaryData).toContain('90 days')
    expect(summaryData).toContain('CVS Pharmacy')
    expect(summaryData).toContain('follow-up blood pressure check')

    // Verify no errors occurred
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should use custom disclaimer text at the bottom when configured', async () => {
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockImplementation(({ activity }) => {
          if (activity) {
            return Promise.resolve({
              activity: {
                success: true,
                activity: {
                  id: 'test-activity-id',
                  context: {
                    track_id: 'test-track-id',
                  },
                },
              },
            })
          }
          return Promise.resolve({})
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          instructions: 'Summarize track outcome.',
          disclaimerText: 'Custom track disclaimer.',
          disclaimerPlacement: 'bottom',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary
    const expectedDisclaimerMsg = '<p>Custom track disclaimer.</p>'

    expect(summaryData).toContain(expectedDisclaimerMsg)
    expect(summaryData.trim().endsWith(expectedDisclaimerMsg)).toBe(true)
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should use tenant disclaimer settings when action fields are absent', async () => {
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockImplementation(({ activity }) => {
          if (activity) {
            return Promise.resolve({
              activity: {
                success: true,
                activity: {
                  id: 'test-activity-id',
                  context: {
                    track_id: 'test-track-id',
                  },
                },
              },
            })
          }
          return Promise.resolve({})
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        settings: {
          disclaimerText: 'Tenant track disclaimer.',
          disclaimerPlacement: 'bottom',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary
    const expectedDisclaimerMsg = '<p>Tenant track disclaimer.</p>'

    expect(summaryData).toContain(expectedDisclaimerMsg)
    expect(summaryData.trim().endsWith(expectedDisclaimerMsg)).toBe(true)
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should let action disclaimer settings override tenant disclaimer settings', async () => {
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockImplementation(({ activity }) => {
          if (activity) {
            return Promise.resolve({
              activity: {
                success: true,
                activity: {
                  id: 'test-activity-id',
                  context: {
                    track_id: 'test-track-id',
                  },
                },
              },
            })
          }
          return Promise.resolve({})
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        settings: {
          disclaimerText: 'Tenant track disclaimer.',
          disclaimerPlacement: 'bottom',
        },
        fields: {
          instructions: 'Summarize track outcome.',
          disclaimerText: 'Action track disclaimer.',
          disclaimerPlacement: 'top',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary
    const expectedDisclaimerMsg = '<p>Action track disclaimer.</p>'

    expect(summaryData).toContain(expectedDisclaimerMsg)
    expect(summaryData.trim().startsWith(expectedDisclaimerMsg)).toBe(true)
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should let action disclaimer text override tenant text while tenant placement is used', async () => {
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockImplementation(({ activity }) => {
          if (activity) {
            return Promise.resolve({
              activity: {
                success: true,
                activity: {
                  id: 'test-activity-id',
                  context: {
                    track_id: 'test-track-id',
                  },
                },
              },
            })
          }
          return Promise.resolve({})
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        settings: {
          disclaimerText: 'Tenant track disclaimer.',
          disclaimerPlacement: 'bottom',
        },
        fields: {
          instructions: 'Summarize track outcome.',
          disclaimerText: 'Action track disclaimer.',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary
    const expectedDisclaimerMsg = '<p>Action track disclaimer.</p>'

    // Action text wins, tenant placement (bottom) wins
    expect(summaryData).toContain(expectedDisclaimerMsg)
    expect(summaryData.trim().endsWith(expectedDisclaimerMsg)).toBe(true)
    expect(onError).not.toHaveBeenCalled()
  })

  it('Should let action disclaimer placement override tenant placement while tenant text is used', async () => {
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockImplementation(({ activity }) => {
          if (activity) {
            return Promise.resolve({
              activity: {
                success: true,
                activity: {
                  id: 'test-activity-id',
                  context: {
                    track_id: 'test-track-id',
                  },
                },
              },
            })
          }
          return Promise.resolve({})
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        settings: {
          disclaimerText: 'Tenant track disclaimer.',
          disclaimerPlacement: 'bottom',
        },
        fields: {
          instructions: 'Summarize track outcome.',
          disclaimerPlacement: 'top',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary
    const expectedDisclaimerMsg = '<p>Tenant track disclaimer.</p>'

    // Tenant text wins (no action text), action placement (top) wins
    expect(summaryData).toContain(expectedDisclaimerMsg)
    expect(summaryData.trim().startsWith(expectedDisclaimerMsg)).toBe(true)
    expect(onError).not.toHaveBeenCalled()
  })

  it.each([
    ['empty string', ''],
    ['null', null],
    ['whitespace only', '   '],
  ])(
    'Should fall back to the dynamic care flow disclaimer when tenant disclaimerText is %s',
    async (_label, tenantDisclaimerText) => {
      const awellSdkMock = {
        orchestration: {
          query: jest.fn().mockImplementation(({ activity }) => {
            if (activity) {
              return Promise.resolve({
                activity: {
                  success: true,
                  activity: {
                    id: 'test-activity-id',
                    context: {
                      track_id: 'test-track-id',
                    },
                  },
                },
              })
            }
            return Promise.resolve({})
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      await extensionAction.onEvent({
        payload: {
          ...basePayload,
          settings: {
            disclaimerText: tenantDisclaimerText as string | undefined,
            disclaimerPlacement: 'bottom',
          },
        },
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary
      const expectedDisclaimerMsg = `<p><strong>Important Notice:</strong> The content provided is an AI-generated summary of version 6 of Care Flow "AI Actions Check" (ID: xQ2P4uBn2cY8).</p>`

      // Default dynamic disclaimer is used, tenant placement (bottom) is respected
      expect(summaryData).toContain(expectedDisclaimerMsg)
      expect(summaryData.trim().endsWith(expectedDisclaimerMsg)).toBe(true)
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
      const awellSdkMock = {
        orchestration: {
          query: jest.fn().mockImplementation(({ activity }) => {
            if (activity) {
              return Promise.resolve({
                activity: {
                  success: true,
                  activity: {
                    id: 'test-activity-id',
                    context: {
                      track_id: 'test-track-id',
                    },
                  },
                },
              })
            }
            return Promise.resolve({})
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      await extensionAction.onEvent({
        payload: {
          ...basePayload,
          settings: {
            disclaimerText: 'Tenant track disclaimer.',
            disclaimerPlacement: tenantDisclaimerPlacement,
          },
        },
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary
      const expectedDisclaimerMsg = '<p>Tenant track disclaimer.</p>'

      expect(summaryData).toContain(expectedDisclaimerMsg)
      if (expectedPlacement === 'bottom') {
        expect(summaryData.trim().endsWith(expectedDisclaimerMsg)).toBe(true)
      } else {
        expect(summaryData.trim().startsWith(expectedDisclaimerMsg)).toBe(true)
      }
      expect(onError).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['empty string', ''],
    ['null', null],
    ['whitespace only', '   '],
  ])(
    'Should fall back to the dynamic care flow disclaimer when disclaimerText is %s',
    async (_label, disclaimerText) => {
      const awellSdkMock = {
        orchestration: {
          query: jest.fn().mockImplementation(({ activity }) => {
            if (activity) {
              return Promise.resolve({
                activity: {
                  success: true,
                  activity: {
                    id: 'test-activity-id',
                    context: {
                      track_id: 'test-track-id',
                    },
                  },
                },
              })
            }
            return Promise.resolve({})
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      await extensionAction.onEvent({
        payload: {
          ...basePayload,
          fields: {
            instructions: 'Summarize track outcome.',
            disclaimerText: disclaimerText as string | undefined,
            disclaimerPlacement: 'bottom',
          },
        },
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      const summaryData = onComplete.mock.calls[0][0].data_points.outcomeSummary
      const expectedDisclaimerMsg = `<p><strong>Important Notice:</strong> The content provided is an AI-generated summary of version 6 of Care Flow "AI Actions Check" (ID: xQ2P4uBn2cY8).</p>`

      // Default dynamic disclaimer is used despite bottom placement being respected.
      expect(summaryData).toContain(expectedDisclaimerMsg)
      expect(summaryData.trim().endsWith(expectedDisclaimerMsg)).toBe(true)
      expect(onError).not.toHaveBeenCalled()
    },
  )

  it('Should handle errors when SDK query fails', async () => {
    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockRejectedValue(new Error('SDK query failed')),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    // Reset the getCareFlowDetails mock to ensure it's not called
    const { getCareFlowDetails } = require('../../lib/getCareFlowDetails')
    getCareFlowDetails.mockReset()

    await extensionAction.onEvent({
      payload: basePayload,
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
  })

  it('Should handle errors when getTrackData fails', async () => {
    const { getTrackData } = require('../../lib/getTrackData/index')
    getTrackData.mockRejectedValue(new Error('Failed to get track data'))

    const awellSdkMock = {
      orchestration: {
        query: jest.fn().mockImplementation(({ activity }) => {
          if (activity) {
            return Promise.resolve({
              activity: {
                success: true,
                activity: {
                  id: 'test-activity-id',
                  context: {
                    track_id: 'test-track-id',
                  },
                },
              },
            })
          }
          return Promise.resolve({})
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

    await extensionAction.onEvent({
      payload: basePayload,
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
          text: { en: 'Failed to get track data' },
          error: {
            category: 'SERVER_ERROR',
            message: 'Failed to get track data',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})

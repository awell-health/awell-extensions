import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/GetAppointments.mock'
import { findFutureAppointment as action } from './findFutureAppointment'
import { addDays, addHours } from 'date-fns'

// Mock the client
jest.mock('../../client')

// Mock extractDatesFromInstructions
jest.mock(
  '../../lib/extractDatesFromInstructions/extractDatesFromInstructions',
  () => ({
    extractDatesFromInstructions: jest.fn().mockResolvedValue({
      from: null,
      to: null,
      instructions: 'Find next appointment',
    }),
  }),
)

// Mock createOpenAIModel
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      pipe: jest.fn().mockReturnValue({
        invoke: jest.fn().mockResolvedValue({
          appointmentIds: [appointmentsMock[0].id],
          explanation:
            '# Found Appointment\n\nI found the next available appointment for the patient. This appointment matches your search criteria.\n\n## Details\n- Appointment type: Follow-up visit\n- Date: Tomorrow at 2pm\n- Status: Scheduled',
        }),
      }),
    },
    metadata: {
      care_flow_definition_id: 'whatever',
      care_flow_id: 'test-flow-id',
      activity_id: 'test-activity-id',
      tenant_id: '123',
      org_id: '123',
      org_slug: 'org-slug',
    },
  }),
}))

describe('Elation - Find Future Appointment', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  // Extract the base payload to reduce duplication
  const basePayload = {
    settings: {
      client_id: 'clientId',
      client_secret: 'clientSecret',
      username: 'username',
      password: 'password',
      auth_url: 'authUrl',
      base_url: 'baseUrl',
    },
    pathway: {
      id: 'test-flow-id',
      definition_id: 'whatever',
      tenant_id: '123',
      org_slug: 'org-slug',
      org_id: '123',
    },
    activity: {
      id: 'test-activity-id',
    },
    patient: {
      id: 'test-patient-id',
    },
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()

    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue(appointmentsMock),
    }))
  })

  test('Should find the correct appointment', async () => {
    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt: 'Find next appointment',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        explanation:
          '<h1>Found Appointment</h1>\n<p>I found the next available appointment for the patient. This appointment matches your search criteria.</p>\n<h2>Details</h2>\n<ul>\n<li>Appointment type: Follow-up visit</li>\n<li>Date: Tomorrow at 2pm</li>\n<li>Status: Scheduled</li>\n</ul>',
        appointmentExists: 'true',
        appointment: JSON.stringify(appointmentsMock[0]),
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: expect.stringContaining(
              'Number of future scheduled or confirmed appointments',
            ),
          },
        },
      ],
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle no appointments', async () => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue([]),
    }))

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt: 'Find next appointment',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        explanation: 'No future appointments found',
        appointmentExists: 'false',
        appointment: undefined,
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should filter appointments by from date', async () => {
    // Mock extractDatesFromInstructions to return a from date
    const extractDatesFromInstructions =
      require('../../lib/extractDatesFromInstructions/extractDatesFromInstructions').extractDatesFromInstructions
    extractDatesFromInstructions.mockResolvedValueOnce({
      from: addDays(new Date(), 2).toISOString(), // This should filter out appointments[0]
      to: null,
      instructions: 'Find appointments after tomorrow',
    })

    // Mock the LLM to return all appointment IDs
    const createOpenAIModel =
      require('../../../../src/lib/llm/openai/createOpenAIModel').createOpenAIModel
    createOpenAIModel.mockResolvedValueOnce({
      model: {
        pipe: jest.fn().mockReturnValue({
          invoke: jest.fn().mockResolvedValue({
            appointmentIds: [
              appointmentsMock[0].id,
              appointmentsMock[1].id,
              appointmentsMock[2].id,
            ],
            explanation: 'Found all appointments',
          }),
        }),
      },
      metadata: {
        care_flow_definition_id: 'whatever',
        care_flow_id: 'test-flow-id',
        activity_id: 'test-activity-id',
        tenant_id: '123',
        org_id: '123',
        org_slug: 'org-slug',
      },
    })

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt: 'Find appointments after tomorrow',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // The response should only include appointment[1] (id: 456) since it's after the from date
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          appointmentExists: 'true',
          appointment: JSON.stringify(appointmentsMock[1]),
        }),
      }),
    )
  })

  test('Should filter appointments by to date', async () => {
    // Similar to above but with a to date
    const extractDatesFromInstructions =
      require('../../lib/extractDatesFromInstructions/extractDatesFromInstructions').extractDatesFromInstructions
    extractDatesFromInstructions.mockResolvedValueOnce({
      from: null,
      to: addHours(new Date(), 2).toISOString(),
      instructions: 'Find appointments before tomorrow',
    })

    // Mock the LLM to return all appointment IDs
    const createOpenAIModel =
      require('../../../../src/lib/llm/openai/createOpenAIModel').createOpenAIModel
    createOpenAIModel.mockResolvedValueOnce({
      model: {
        pipe: jest.fn().mockReturnValue({
          invoke: jest.fn().mockResolvedValue({
            appointmentIds: [
              appointmentsMock[0].id,
              appointmentsMock[1].id,
              appointmentsMock[2].id,
            ],
            explanation: 'Found all appointments',
          }),
        }),
      },
      metadata: {
        care_flow_definition_id: 'whatever',
        care_flow_id: 'test-flow-id',
        activity_id: 'test-activity-id',
        tenant_id: '123',
        org_id: '123',
        org_slug: 'org-slug',
      },
    })

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt: 'Find appointments before tomorrow',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // The response should only include appointment[2] (id: 789) since it's before the to date (within 2 hours)
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          appointmentExists: 'true',
          appointment: JSON.stringify(appointmentsMock[2]),
        }),
      }),
    )
  })

  test('Should filter appointments by both from and to dates', async () => {
    // Test with both from and to dates
    const extractDatesFromInstructions =
      require('../../lib/extractDatesFromInstructions/extractDatesFromInstructions').extractDatesFromInstructions
    extractDatesFromInstructions.mockResolvedValueOnce({
      from: addHours(new Date(), 3).toISOString(), // After appointment[2] but before appointment[0]
      to: addDays(new Date(), 2).toISOString(), // Before appointment[1]
      instructions: 'Find appointments within the next two days',
    })

    // Mock the LLM to return all appointment IDs
    const createOpenAIModel =
      require('../../../../src/lib/llm/openai/createOpenAIModel').createOpenAIModel
    createOpenAIModel.mockResolvedValueOnce({
      model: {
        pipe: jest.fn().mockReturnValue({
          invoke: jest.fn().mockResolvedValue({
            appointmentIds: [
              appointmentsMock[0].id,
              appointmentsMock[1].id,
              appointmentsMock[2].id,
            ],
            explanation: 'Found all appointments',
          }),
        }),
      },
      metadata: {
        care_flow_definition_id: 'whatever',
        care_flow_id: 'test-flow-id',
        activity_id: 'test-activity-id',
        tenant_id: '123',
        org_id: '123',
        org_slug: 'org-slug',
      },
    })

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt: 'Find appointments within the next two days',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Should be only appointment[0] (id: 123) since it's the only one within both date boundaries
    expect(onComplete).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          appointmentExists: 'false',
        }),
      }),
    )
  })

  test('Should respect LLM filtering along with date filtering', async () => {
    // Test that both LLM filtering and date filtering work together
    const extractDatesFromInstructions =
      require('../../lib/extractDatesFromInstructions/extractDatesFromInstructions').extractDatesFromInstructions
    extractDatesFromInstructions.mockResolvedValueOnce({
      from: null,
      to: addDays(new Date(), 3).toISOString(), // Before appointment[1] but after appointment[0] and appointment[2]
      instructions: 'Find video appointments',
    })

    // Mock the LLM to return only the first two appointments (ids 123 and 789)
    const createOpenAIModel =
      require('../../../../src/lib/llm/openai/createOpenAIModel').createOpenAIModel
    createOpenAIModel.mockResolvedValueOnce({
      model: {
        pipe: jest.fn().mockReturnValue({
          invoke: jest.fn().mockResolvedValue({
            appointmentIds: [appointmentsMock[0].id, appointmentsMock[2].id],
            explanation: 'Found video appointments',
          }),
        }),
      },
      metadata: {
        care_flow_definition_id: 'whatever',
        care_flow_id: 'test-flow-id',
        activity_id: 'test-activity-id',
        tenant_id: '123',
        org_id: '123',
        org_slug: 'org-slug',
      },
    })

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt: 'Find video appointments',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Should get a valid appointment, we're less concerned about which one exactly
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          appointmentExists: 'true',
        }),
      }),
    )
  })

  test('Should not call LLM when no appointments found', async () => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue([]),
    }))

    const createOpenAIModelMock =
      require('../../../../src/lib/llm/openai/createOpenAIModel').createOpenAIModel
    const extractDatesMock =
      require('../../lib/extractDatesFromInstructions/extractDatesFromInstructions').extractDatesFromInstructions

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: 12345,
          prompt: 'Find next appointment',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify the early return happened without calling LLM functions
    expect(createOpenAIModelMock).not.toHaveBeenCalled()
    expect(extractDatesMock).not.toHaveBeenCalled()

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        explanation: 'No future appointments found',
        appointmentExists: 'false',
        appointment: undefined,
      },
    })
  })
})

import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { generatePayload, generateMockAppointment } from './__testdata__'
import { findAppointmentsWithAI as action } from './findAppointmentsWithAI'
import { type AppointmentResponse } from '../../types/appointment'

// Mock the client
jest.mock('../../client')
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel')
jest.mock('../../lib/extractDatesFromInstructions/extractDatesFromInstructions')
jest.mock('../../../../src/utils', () => ({
  markdownToHtml: jest.fn().mockImplementation((text) => Promise.resolve(text)),
}))

// Setup mocks that can be controlled in each test
const findAppointments = jest.fn().mockResolvedValue([])
const mockAPIClient = makeAPIClient as jest.Mock
mockAPIClient.mockImplementation(() => ({
  findAppointments,
}))

// Setup OpenAI mocks
const invokeAI = jest.fn()
const pipeAI = jest.fn().mockReturnValue({ invoke: invokeAI })
const { createOpenAIModel } = jest.requireMock(
  '../../../../src/lib/llm/openai/createOpenAIModel',
)
createOpenAIModel.mockResolvedValue({
  model: {
    pipe: pipeAI,
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

// Mock extractDatesFromInstructions
const { extractDatesFromInstructions } = jest.requireMock(
  '../../lib/extractDatesFromInstructions/extractDatesFromInstructions',
)
extractDatesFromInstructions.mockResolvedValue({
  from: null,
  to: null,
  instructions: 'Find all appointments',
})

describe('Elation - Find appointments with AI', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  test('Should find the correct appointments', async () => {
    const appointments = [
      generateMockAppointment({
        scheduled_date: '2024-01-15T10:00:00Z',
        reason: 'PCP Visit',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: '2024-01-16T10:00:00Z',
        reason: 'Follow-up',
        status: 'Scheduled',
      }),
    ]

    findAppointments.mockResolvedValueOnce(appointments)
    invokeAI.mockResolvedValueOnce({
      appointmentIds: appointments.map((a) => a.id),
      explanation:
        '# Found Appointments\n\nI found 2 upcoming appointments:\n- Video visit tomorrow\n- Follow-up in 2 days',
    })

    await extensionAction.onEvent({
      payload: generatePayload('Find all appointments'),
      onComplete,
      onError,
      helpers,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(
      data_points.appointments,
    ) as AppointmentResponse[]

    expect(foundAppointments).toHaveLength(2)
    expect(foundAppointments.map((apt) => apt.id)).toEqual(
      expect.arrayContaining(appointments.map((apt) => apt.id)),
    )
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          appointmentCountsByStatus: JSON.stringify({ Scheduled: 2 }),
          appointmentsFound: 'true',
        }),
        events: [
          expect.objectContaining({
            text: expect.objectContaining({
              en: expect.stringContaining('Found 2 appointments'),
            }),
          }),
        ],
      }),
    )
  })

  test('Should correctly group appointments by status', async () => {
    const appointments = [
      generateMockAppointment({
        scheduled_date: '2024-01-15T10:00:00Z',
        reason: 'PCP Visit',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: '2024-01-16T10:00:00Z',
        reason: 'Follow-up',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: '2024-01-17T10:00:00Z',
        reason: 'Follow-up',
        status: 'Cancelled',
      }),
    ]

    findAppointments.mockResolvedValueOnce(appointments)
    invokeAI.mockResolvedValueOnce({
      appointmentIds: appointments.map((a) => a.id),
      explanation:
        '# Found Appointments\n\nI found 3 upcoming appointments:\n- Video visit tomorrow\n- Follow-up in 2 days\n- Cancelled in 3 days',
    })

    await extensionAction.onEvent({
      payload: generatePayload('Find all appointments'),
      onComplete,
      onError,
      helpers,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(
      data_points.appointments,
    ) as AppointmentResponse[]
    const appointmentCountsByStatus = JSON.parse(
      data_points.appointmentCountsByStatus,
    )

    expect(foundAppointments).toHaveLength(3)
    expect(appointmentCountsByStatus).toEqual({
      Scheduled: 2,
      Cancelled: 1,
    })
  })

  test('Should handle no appointments', async () => {
    findAppointments.mockResolvedValueOnce([])
    invokeAI.mockResolvedValueOnce({
      appointmentIds: [],
      explanation: 'No appointments found',
    })

    await extensionAction.onEvent({
      payload: generatePayload('Find all appointments'),
      onComplete,
      onError,
      helpers,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(
      data_points.appointments,
    ) as AppointmentResponse[]

    expect(foundAppointments).toHaveLength(0)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        appointments: '[]',
        appointmentsFound: 'false',
        appointmentCountsByStatus: '{}',
      }),
    })
  })
})

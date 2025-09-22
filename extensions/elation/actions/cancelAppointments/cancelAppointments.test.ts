import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/Findappointments.mock'
import { cancelAppointments } from './cancelAppointments'
import { addDays, addHours, format } from 'date-fns'

// Create a tomorrow date for testing
const tomorrow = addDays(new Date(), 1)
const dayAfterTomorrow = addDays(new Date(), 2)
const tomorrowFormatted = format(tomorrow, 'MMMM d, yyyy')

const dynamicAppointmentsMock = [
  {
    ...appointmentsMock[0],
    id: 123,
    scheduled_date: addHours(tomorrow, 10).toISOString(),
    reason: 'PCP Video Visit',
    mode: 'VIDEO',
    status: { status: 'Scheduled' },
  },
  {
    ...appointmentsMock[1],
    id: 456,
    scheduled_date: dayAfterTomorrow.toISOString(),
    reason: 'PCP Follow-up Visit',
    mode: 'VIDEO',
    status: { status: 'Scheduled' },
  },
]

// Mock modular OpenAI
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockImplementation(() => {
            return Promise.resolve({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      appointmentIds: [123, 456],
                      explanation:
                        'Both appointments matched the cancellation criteria.',
                    }),
                  },
                },
              ],
            })
          }),
        },
      },
    })),
  }
})

jest.mock('../../client')

describe('cancelAppointments', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(cancelAppointments)

  // Mock for tracking which appointments were cancelled
  const cancelledAppointments = new Set<string>()

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    cancelledAppointments.clear()

    // Set up OpenAI config
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: 'test-api-key',
      temperature: 0,
      maxRetries: 2,
      timeout: 30000,
    })

    // Mock the client
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue(dynamicAppointmentsMock),
      updateAppointment: jest.fn().mockImplementation((appointmentId) => {
        cancelledAppointments.add(String(appointmentId))
        return Promise.resolve({})
      }),
    }))
  })

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
      org_slug: 'test-org-slug',
      org_id: 'test-org-id',
    },
    activity: {
      id: 'test-activity-id',
    },
    patient: {
      id: 'test-patient-id',
    },
  }

  test('Should cancel all appointments', async () => {
    // Configure mock for this test
    const openai = require('openai')
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              appointmentIds: [123, 456],
              explanation:
                'Both appointments matched the cancellation criteria.',
            }),
          },
        },
      ],
    })
    openai.OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }))

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: '12345',
          prompt:
            'I need to cancel both of my appointments (appointments with ID 123 and 456). Please cancel both of these appointments immediately.',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify onComplete was called and retrieve its first argument
    expect(onComplete).toHaveBeenCalled()
    const result = onComplete.mock.calls[0][0]

    // Check data points structure
    expect(result).toHaveProperty('data_points')
    expect(result.data_points).toHaveProperty('cancelledAppointments')
    expect(result.data_points).toHaveProperty('explanation')

    const cancelledData = JSON.parse(result.data_points.cancelledAppointments)

    // Check if cancelledData is an array of objects with id property, or array of IDs
    if (Array.isArray(cancelledData) && cancelledData.length > 0) {
      if (typeof cancelledData[0] === 'object' && cancelledData[0] !== null) {
        // It's an array of appointment objects
        const cancelledIds = cancelledData.map((appt) => appt.id)
        expect(cancelledIds).toContain(123)
        expect(cancelledIds).toContain(456)
        expect(cancelledIds.length).toBe(2)
      } else {
        // It's an array of IDs
        expect(cancelledData).toContain(123)
        expect(cancelledData).toContain(456)
        expect(cancelledData.length).toBe(2)
      }
    }

    expect(result).toHaveProperty('events')
    expect(result.events[0].text.en).toContain(
      'appointments for patient 12345 were cancelled',
    )

    // Validate specific appointments were cancelled via the mock
    expect(cancelledAppointments.has('123')).toBe(true)
    expect(cancelledAppointments.has('456')).toBe(true)
    expect(cancelledAppointments.size).toBe(2)

    expect(onError).not.toHaveBeenCalled()
  })

  test("Should cancel only tomorrow's appointment", async () => {
    const openai = require('openai')
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              appointmentIds: [123],
              explanation: 'Selected the appointment scheduled for tomorrow.',
            }),
          },
        },
      ],
    })
    openai.OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }))

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: '12345',
          prompt: `Cancel my appointment with ID 123. This is my PCP Video Visit scheduled for ${tomorrowFormatted}.`,
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify onComplete was called and retrieve its first argument
    expect(onComplete).toHaveBeenCalled()
    const result = onComplete.mock.calls[0][0]

    // Check data points structure
    expect(result).toHaveProperty('data_points')
    expect(result.data_points).toHaveProperty('cancelledAppointments')
    expect(result.data_points).toHaveProperty('explanation')

    // Parse the cancelledAppointments string and verify IDs
    const cancelledData = JSON.parse(result.data_points.cancelledAppointments)

    // Check if cancelledData is an array of objects with id property, or array of IDs
    if (Array.isArray(cancelledData) && cancelledData.length > 0) {
      if (typeof cancelledData[0] === 'object' && cancelledData[0] !== null) {
        // It's an array of appointment objects
        const cancelledIds = cancelledData.map((appt) => appt.id)
        expect(cancelledIds).toContain(123)
        expect(cancelledIds).not.toContain(456)
        expect(cancelledIds.length).toBe(1)
      } else {
        // It's an array of IDs
        expect(cancelledData).toContain(123)
        expect(cancelledData).not.toContain(456)
        expect(cancelledData.length).toBe(1)
      }
    }

    // Validate appointments were cancelled via the mock
    expect(cancelledAppointments.has('123')).toBe(true)
    expect(cancelledAppointments.has('456')).toBe(false)
    expect(cancelledAppointments.size).toBe(1)

    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle empty appointment list', async () => {
    // Configure the mock to return empty results
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementationOnce(() => ({
      findAppointments: jest.fn().mockResolvedValue([]),
      updateAppointment: jest.fn().mockResolvedValue({}),
    }))

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: '12345',
          prompt: 'Cancel my video appointments',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify onComplete was called with empty appointments
    expect(onComplete).toHaveBeenCalled()
    const result = onComplete.mock.calls[0][0]

    expect(result.data_points.cancelledAppointments).toBe('[]')
    expect(result.data_points.explanation).toContain('No')

    // No call to OpenAI should be made
    const openai = require('openai')
    expect(openai.OpenAI).not.toHaveBeenCalled()

    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle API errors when cancelling appointments', async () => {
    // Configure mock for this test
    const openai = require('openai')
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              appointmentIds: [123, 456],
              explanation:
                'Both appointments matched the cancellation criteria.',
            }),
          },
        },
      ],
    })
    openai.OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }))

    // Mock the API client to succeed for first appointment but fail for second
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementationOnce(() => ({
      findAppointments: jest.fn().mockResolvedValue(dynamicAppointmentsMock),
      updateAppointment: jest.fn().mockImplementation((appointmentId) => {
        if (appointmentId === 123) {
          cancelledAppointments.add(String(appointmentId))
          return Promise.resolve({})
        } else {
          return Promise.reject(new Error('API Error'))
        }
      }),
    }))

    await extensionAction.onEvent({
      payload: {
        ...basePayload,
        fields: {
          patientId: '12345',
          prompt:
            'I need to cancel both of my appointments (appointments with ID 123 and 456). Please cancel both of these appointments immediately.',
        },
      },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify onError was called with partial success and failure
    expect(onError).toHaveBeenCalled()
    const errorResult = onError.mock.calls[0][0]

    // Check for success and failure events
    expect(errorResult.events.length).toBeGreaterThanOrEqual(2)

    // Verify one event mentions successful cancellation
    const successEvent = errorResult.events.find(
      (e: { text: { en: string } }) =>
        e.text.en.includes('Successfully cancelled'),
    )
    expect(successEvent).toBeTruthy()

    // Verify one event mentions failed cancellation
    const failureEvent = errorResult.events.find(
      (e: { text: { en: string } }) => e.text.en.includes('Failed to cancel'),
    )
    expect(failureEvent).toBeTruthy()

    // Should have attempted to cancel only the first one successfully
    expect(cancelledAppointments.size).toBe(1)
    expect(cancelledAppointments.has('123')).toBe(true)

    // Should not have called onComplete
    expect(onComplete).not.toHaveBeenCalled()
  })
})

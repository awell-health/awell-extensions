import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { findAppointmentsWithAI } from './findAppointmentsWithAI'
import { addHours } from 'date-fns'
import { type AppointmentResponse } from '../../types/appointment'
import { generateMockAppointment, generatePayload } from './__testdata__'

// Setup a mock to control the appointments returned in each test
jest.mock('../../client')
jest.setTimeout(60000)

const findAppointments = jest
  .fn<Promise<Array<AppointmentResponse>>, never>()
  .mockResolvedValue([])
const mockAPIClient = makeAPIClient as jest.Mock
mockAPIClient.mockImplementation(() => ({
  findAppointments,
}))

describe.skip('findAppointmentsWithAI - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(findAppointmentsWithAI)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()

    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key'

    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 2,
      timeout: 30000,
    })
  })

  test('Should find all appointments', async () => {
    const appointments = [
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 12).toISOString(),
        reason: 'PCP Visit',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 24).toISOString(),
        reason: 'Follow-up',
        status: 'Scheduled',
      }),
    ]
    findAppointments.mockResolvedValueOnce(appointments)

    await extensionAction.onEvent({
      payload: generatePayload('Find all appointments'),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(data_points.appointments)
    const explanation = data_points.explanation
    console.log(explanation)

    // Verify the number of appointments found
    expect(foundAppointments).toHaveLength(2)

    // Verify both appointments are included by checking their IDs
    expect(foundAppointments.map((apt: AppointmentResponse) => apt.id)).toEqual(
      expect.arrayContaining([appointments[0].id, appointments[1].id]),
    )

    // Verify the success event was created
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            text: expect.objectContaining({
              en: expect.stringContaining('Found 2 appointments'),
            }),
          }),
        ],
      }),
    )
  }, 60000)

  test('Should find appointments by reason', async () => {
    const appointments = [
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 12).toISOString(),
        reason: 'PCP Visit',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 24).toISOString(),
        reason: 'Dental Cleaning', // Should not be found
        status: 'Scheduled',
      }),
    ]
    findAppointments.mockResolvedValueOnce(appointments)

    await extensionAction.onEvent({
      payload: generatePayload('Find PCP appointments'),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(data_points.appointments)
    const explanation = data_points.explanation
    console.log(explanation)

    expect(foundAppointments).toHaveLength(1)
    expect(foundAppointments[0].reason).toBe('PCP Visit')
  }, 60000)

  test('Should find appointments by mode', async () => {
    const appointments = [
      generateMockAppointment(
        {
          scheduled_date: addHours(new Date(), 12).toISOString(),
          reason: 'PCP Visit',
          status: 'Scheduled',
        },
        { mode: 'VIDEO' },
      ),
      generateMockAppointment(
        {
          scheduled_date: addHours(new Date(), 24).toISOString(),
          reason: 'Follow-up',
          status: 'Scheduled',
        },
        { mode: 'IN_PERSON' },
      ), // Should not be found
    ]
    findAppointments.mockResolvedValueOnce(appointments)

    await extensionAction.onEvent({
      payload: generatePayload('Find video appointments'),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(data_points.appointments)
    const explanation = data_points.explanation
    console.log(explanation)

    expect(foundAppointments).toHaveLength(1)
    expect(foundAppointments[0].mode).toBe('VIDEO')
  }, 60000)

  test('Should find appointments by status', async () => {
    const appointments = [
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 12).toISOString(),
        reason: 'PCP Visit',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 24).toISOString(),
        reason: 'Follow-up',
        status: 'Cancelled', // Should not be found
      }),
    ]
    findAppointments.mockResolvedValueOnce(appointments)

    await extensionAction.onEvent({
      payload: generatePayload('Find appointments with status "Scheduled"'),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(data_points.appointments)
    const explanation = data_points.explanation
    console.log(explanation)

    expect(foundAppointments).toHaveLength(1)
    expect(foundAppointments[0].status.status).toBe('Scheduled')
  }, 60000)

  test('Should find appointments scheduled after a given year and month', async () => {
    const appointments = [
      generateMockAppointment({
        scheduled_date: '2024-01-15T10:00:00Z',
        reason: 'PCP Visit',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: '2023-11-15T10:00:00Z', // Should not be found
        reason: 'Follow-up',
        status: 'Scheduled',
      }),
    ]
    findAppointments.mockResolvedValueOnce(appointments)

    await extensionAction.onEvent({
      payload: generatePayload('Find all appointments after December 2023'),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(data_points.appointments)
    const explanation = data_points.explanation
    console.log(explanation)

    expect(foundAppointments).toHaveLength(1)
    expect(foundAppointments[0].scheduled_date).toBe('2024-01-15T10:00:00Z')
  }, 60000)

  test('Should find appointments scheduled in a given year', async () => {
    const appointments = [
      generateMockAppointment({
        scheduled_date: '2024-01-15T10:00:00Z',
        reason: 'PCP Visit',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: '2023-12-15T10:00:00Z', // Should not be found
        reason: 'Follow-up',
        status: 'Scheduled',
      }),
    ]
    findAppointments.mockResolvedValueOnce(appointments)

    await extensionAction.onEvent({
      payload: generatePayload('Find all appointments in 2024'),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(data_points.appointments)
    const explanation = data_points.explanation
    console.log(explanation)

    expect(foundAppointments).toHaveLength(1)
    expect(foundAppointments[0].scheduled_date).toBe('2024-01-15T10:00:00Z')
  }, 60000)

  test('Should find appointments scheduled in a relative time window', async () => {
    const appointments = [
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 12).toISOString(),
        reason: 'PCP Visit',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 48).toISOString(), // Should not be found
        reason: 'Follow-up',
        status: 'Scheduled',
      }),
    ]
    findAppointments.mockResolvedValueOnce(appointments)

    await extensionAction.onEvent({
      payload: generatePayload('Find all appointments in the next 24 hours'),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(data_points.appointments)
    const explanation = data_points.explanation
    console.log(explanation)

    expect(foundAppointments).toHaveLength(1)
    expect(
      new Date(foundAppointments[0].scheduled_date).getTime(),
    ).toBeLessThan(addHours(new Date(), 24).getTime())
  }, 60000)

  test('Should find no appointments when none match criteria', async () => {
    const appointments = [
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 12).toISOString(),
        reason: 'PCP Visit',
        status: 'Scheduled',
      }),
      generateMockAppointment({
        scheduled_date: addHours(new Date(), 24).toISOString(),
        reason: 'Follow-up',
        status: 'Scheduled',
      }),
    ]
    findAppointments.mockResolvedValueOnce(appointments)

    await extensionAction.onEvent({
      payload: generatePayload('Find dental cleaning appointments'),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const data_points = (onComplete.mock.calls[0][0] as any).data_points
    const foundAppointments = JSON.parse(data_points.appointments)
    const explanation = data_points.explanation
    console.log(explanation)

    expect(foundAppointments).toHaveLength(0)
  }, 60000)
})

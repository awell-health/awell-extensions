import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/GetAppointments.mock'
import { findAppointmentsWithAI } from './findAppointmentsWithAI'

// Only mock the client, not OpenAI
jest.mock('../../client')
jest.setTimeout(60000)

describe.skip('findAppointmentsWithAI - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(findAppointmentsWithAI)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    
    // Set up OpenAI config
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key'
    
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 2,
      timeout: 30000
    })

    // Mock only the client, not OpenAI
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue(appointmentsMock)
    }))
  })

  const testCases = [
    {
      name: 'find all appointments',
      prompt: 'Find all appointments',
      shouldFind: true,
      expectedCount: 2,
      validate: (appointments: typeof appointmentsMock) => {
        expect(appointments).toHaveLength(2)
      }
    },
    {
      name: 'find PCP appointments',
      prompt: 'Find PCP appointments',
      shouldFind: true,
      expectedCount: 2,
      validate: (appointments: typeof appointmentsMock) => {
        appointments.forEach(apt => {
          expect(apt.reason).toContain('PCP')
        })
      }
    },
    {
      name: 'find video appointments',
      prompt: 'Find video appointments',
      shouldFind: true,
      expectedCount: 2,
      validate: (appointments: typeof appointmentsMock) => {
        appointments.forEach(apt => {
          expect(apt.mode).toBe('VIDEO')
        })
      }
    },
    {
      name: 'find scheduled appointments',
      prompt: 'Find scheduled appointments',
      shouldFind: true,
      expectedCount: 2,
      validate: (appointments: typeof appointmentsMock) => {
        appointments.forEach(apt => {
          expect(apt.status.status).toBe('Scheduled')
        })
      }
    },
    {
      name: 'find appointments scheduled after November 2023',
      prompt: 'Find appointments scheduled after November 2023',
      shouldFind: true,
      expectedCount: 2,
      validate: (appointments: typeof appointmentsMock) => {
        appointments.forEach(apt => {
          const aptDate = new Date(apt.scheduled_date)
          expect(aptDate.getTime()).toBeGreaterThanOrEqual(new Date('2023-12-01').getTime())
        })
      }
    },
    {
      name: 'find appointments scheduled in 2024',
      prompt: 'Find appointments scheduled in 2024',
      shouldFind: false,
      expectedCount: 0,
      validate: (appointments: typeof appointmentsMock) => {
        expect(appointments).toHaveLength(0)
      }
    },
    {
      name: 'find appointments from now until 30 hours from now',
      prompt: 'Find appointments from now until 30 hours from now',
      shouldFind: true,
      expectedCount: 1,
      validate: (appointments: typeof appointmentsMock) => {
        expect(appointments).toHaveLength(1)
        appointments.forEach(apt => {
          const aptDate = new Date(apt.scheduled_date)
          const now = new Date()
          const thirtyHoursFromNow = new Date(now.getTime() + 30 * 60 * 60 * 1000)
          expect(aptDate.getTime()).toBeGreaterThanOrEqual(now.getTime())
          expect(aptDate.getTime()).toBeLessThanOrEqual(thirtyHoursFromNow.getTime())
        })
      }
    },
    {
      name: 'find non-existent appointments',
      prompt: 'Find dental cleaning appointments',
      shouldFind: false,
      expectedCount: 0,
      validate: (appointments: typeof appointmentsMock) => {
        expect(appointments).toHaveLength(0)
      }
    }
  ]

  testCases.forEach(({ name, prompt, shouldFind, expectedCount, validate }) => {
    test(`Should ${name}`, async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            patientId: 12345,
            prompt,
          },
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
            org_id: 'test-org-id'
          },
          activity: {
            id: 'test-activity-id'
          },
          patient: {
            id: 'test-patient-id'
          }
        },
        onComplete,
        onError,
        helpers,
      })

      if (shouldFind) {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            data_points: expect.objectContaining({
              appointments: expect.any(String),
              explanation: expect.any(String),
              appointmentCountsByStatus: expect.stringContaining('Scheduled')
            }),
            events: [
              expect.objectContaining({
                date: expect.any(String),
                text: expect.objectContaining({
                  en: expect.stringContaining(`Found ${expectedCount} appointments`)
                })
              })
            ]
          })
        )
        
        // Validate specific appointment properties
        const appointments = JSON.parse((onComplete.mock.calls[0][0] as any).data_points.appointments)
        validate(appointments)
      } else {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            data_points: expect.objectContaining({
              appointments: '[]',
              explanation: expect.any(String),
              appointmentCountsByStatus: '{}'
            })
          })
        )
        validate([])
      }
      expect(onError).not.toHaveBeenCalled()
    }, 60000)
  })
})
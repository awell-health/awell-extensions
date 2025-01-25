import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/GetAppointments.mock'
import { findAppointmentsByPrompt } from './findAppointmentsByPrompt'

// Only mock the client, not OpenAI
jest.mock('../../client')
jest.setTimeout(60000)

describe.skip('findAppointmentsByPrompt - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(findAppointmentsByPrompt)

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
      expectedCount: 2
    },
    {
      name: 'find established patient visits',
      prompt: 'Find established patient visits',
      shouldFind: true,
      expectedCount: 2
    },
    {
      name: 'find non-existent appointments',
      prompt: 'Find dental cleaning appointments',
      shouldFind: false,
      expectedCount: 0
    },
    {
      name: 'find PCP appointments',
      prompt: 'Find PCP appointments',
      shouldFind: true,
      expectedCount: 2
    }
  ]

  testCases.forEach(({ name, prompt, shouldFind, expectedCount }) => {
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
      }
      expect(onError).not.toHaveBeenCalled()
    }, 60000)
  })
}) 
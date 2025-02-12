import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/GetAppointments.mock'
import { findFutureAppointment } from './findFutureAppointment'
import { addDays } from 'date-fns'

jest.mock('../../client')
jest.setTimeout(60000) // Increased timeout for OpenAI calls

describe.skip('findFutureAppointment - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(findFutureAppointment)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key'
    
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 2,
      timeout: 30000
    })

    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue(appointmentsMock)
    }))
  })

  const testCases = [
    {
      name: 'find video appointment for tomorrow',
      prompt: 'Find the video appointment for tomorrow',
      shouldFind: true,
      expectedId: 123,
      expectedDate: addDays(new Date(), 1).toISOString()
    },
    {
      name: 'find PCP established patient visit',
      prompt: 'Find the PCP established patient office visit',
      shouldFind: true,
      expectedId: 123,
      expectedDate: addDays(new Date(), 1).toISOString()
    },
    {
      name: 'find appointment in 2 days',
      prompt: 'Find the appointment scheduled for 2 days from now',
      shouldFind: true,
      expectedId: 456,
      expectedDate: addDays(new Date(), 2).toISOString()
    },
    {
      name: 'find non-existent in-person appointment',
      prompt: 'Find an in-person appointment',
      shouldFind: false
    },
    {
      name: 'handle empty prompt',
      prompt: ' ',
      shouldFind: false
    },
    {
      name: 'find upcoming appointment in next 2 hours',
      prompt: 'Find any appointment scheduled within the next 2 hours',
      shouldFind: true,
      expectedId: 789
    }
  ]

  testCases.forEach(({ name, prompt, shouldFind, expectedId }) => {
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
            definition_id: '123',
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
        const response = (await onComplete).mock.calls[0][0]
        
        // First check if appointment exists
        expect(response.data_points.appointmentExists).toBe('true')
        
        // Then safely parse appointment if it exists
        if (response.data_points.appointment) {
          const appointmentData = JSON.parse(response.data_points.appointment)
          
          // Add your appointment assertions here
          expect(appointmentData).toEqual(
            expect.objectContaining({
              id: expectedId,
              mode: 'VIDEO',
              reason: 'PCP: Est. Patient Office',
              status: expect.objectContaining({
                status: 'Scheduled'
              }),
              duration: 60,
              patient: 12345
            })
          )
        } else {
          fail('Expected appointment data to be present')
        }
      } else {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            data_points: expect.objectContaining({
              appointmentExists: 'false'
            })
          })
        )
      }
      expect(onError).not.toHaveBeenCalled()
    }, 60000)
  })
})
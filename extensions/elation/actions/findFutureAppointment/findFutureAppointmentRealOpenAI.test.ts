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
        const appointmentData = JSON.parse(
          (await onComplete).mock.calls[0][0].data_points.appointment
        )

        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            data_points: expect.objectContaining({
              appointmentExists: 'true',
              explanation: expect.any(String),
              appointment: expect.stringContaining(expectedId!.toString())
            })
          })
        )

        // Verify specific appointment properties
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
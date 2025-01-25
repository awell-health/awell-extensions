import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/GetAppointments.mock'
import { findFutureAppointment } from './findFutureAppointment'

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
      name: 'find PCP appointment',
      prompt: 'Find the PCP appointment',
      shouldFind: true
    },
    {
      name: 'find established patient visit',
      prompt: 'Find the established patient visit',
      shouldFind: true
    },
    {
      name: 'find office visit',
      prompt: 'Find the office visit appointment',
      shouldFind: true
    },
    {
      name: 'find non-existent type',
      prompt: 'Find the dental cleaning appointment',
      shouldFind: false
    },
    {
      name: 'handle empty prompt',
      prompt: ' a',
      shouldFind: false
    }
  ]

  testCases.forEach(({ name, prompt, shouldFind }) => {
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
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            data_points: expect.objectContaining({
              appointmentExists: 'true',
              explanation: expect.any(String),
              appointment: expect.any(String)
            })
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
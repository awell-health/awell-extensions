import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/GetAppointments.mock'
import { findFutureAppointmentWithAI as action } from './findFutureAppointmentWithAI'

// Mock the client
jest.mock('../../client')

// Mock createOpenAIModel
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      pipe: jest.fn().mockReturnValue({
        invoke: jest.fn().mockResolvedValue({
          appointmentIds: [appointmentsMock[0].id],
          explanation: 'Found the next available appointment'
        })
      })
    },
    metadata: {
      care_flow_definition_id: 'whatever',
      care_flow_id: 'test-flow-id',
      activity_id: 'test-activity-id',
      tenant_id: '123',
      org_id: '123',
      org_slug: 'org-slug'
    }
  })
}))

describe('Elation - Find Future Appointment with AI', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } = 
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()

    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue(appointmentsMock)
    }))
  })

  test('Should find the correct appointment', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          patientId: 12345,
          prompt: 'Find next appointment',
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

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        explanation: 'Found the next available appointment',
        appointmentExists: 'true',
        appointment: JSON.stringify(appointmentsMock[0])
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: expect.stringContaining('Number of future scheduled or confirmed appointments')
          }
        }
      ],
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle no appointments', async () => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn().mockResolvedValue([])
    }))

    await extensionAction.onEvent({
      payload: {
        fields: {
          patientId: 12345,
          prompt: 'Find next appointment',
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

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        explanation: 'No future appointments found',
        appointmentExists: 'false'
      }
    })
    expect(onError).not.toHaveBeenCalled()
  })
})

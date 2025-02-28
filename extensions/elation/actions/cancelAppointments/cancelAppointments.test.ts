import { TestHelpers } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/Findappointments.mock'
import { cancelAppointments as action } from './cancelAppointments'
import { createAxiosError } from '../../../../tests'

// Mock Elation client
jest.mock('../../client', () => ({
  makeAPIClient: jest.fn(),
}))

// Mock createOpenAIModel
jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockResolvedValue({
    model: {
      pipe: jest.fn().mockReturnValue({
        invoke: jest.fn().mockResolvedValue({
          appointmentIds: appointmentsMock.map((a) => a.id),
          explanation:
            '# Found Appointments\n\nI found 2 upcoming appointments:\n- Video visit tomorrow\n- Follow-up in 2 days',
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

describe('Elation - Cancel appointments', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockFindAppointments = jest.fn()
  const mockUpdateAppointment = jest.fn()

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
      definition_id: '123',
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

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: mockFindAppointments,
      updateAppointment: mockUpdateAppointment,
    }))
  })

  describe('When no appointments are found', () => {
    beforeEach(() => {
      mockFindAppointments.mockResolvedValue([])
    })

    test('Should call onComplete with the correct data', async () => {
      await extensionAction.onEvent({
        payload: {
          ...basePayload,
          fields: {
            patientId: 12345,
            prompt: 'Find all appointments',
          },
        },
        onComplete,
        onError,
        helpers,
      })

      expect(mockFindAppointments).toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          cancelledAppointments: JSON.stringify([]),
          explanation: 'No upcoming appointments found so none to cancel.',
        },
        events: [
          {
            date: expect.any(String),
            text: {
              en: `No upcoming appointments found so none to cancel.`,
            },
          },
        ],
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When appointments are found', () => {
    beforeEach(() => {
      mockFindAppointments.mockResolvedValue(appointmentsMock)
    })

    describe('When not all appointments can be cancelled', () => {
      beforeEach(() => {
        mockUpdateAppointment.mockResolvedValueOnce({}) // First update is successful
        mockUpdateAppointment.mockRejectedValueOnce(
          createAxiosError(500, 'Internal server error', JSON.stringify({})),
        ) // Second update fails
      })

      test('Should call onError with the correct data', async () => {
        await extensionAction.onEvent({
          payload: {
            ...basePayload,
            fields: {
              patientId: 12345,
              prompt: 'Find all appointments',
            },
          },
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith({
          events: [
            {
              date: expect.any(String),
              text: {
                en: `Successfully cancelled the following appointments: 123`,
              },
            },
            {
              date: expect.any(String),
              text: {
                en: `Failed to cancel the following appointments: 456`,
              },
            },
          ],
        })
      })
    })

    describe('When all appointments are successfully cancelled', () => {
      test('Should call onComplete with the correct data', async () => {
        await extensionAction.onEvent({
          payload: {
            ...basePayload,
            fields: {
              patientId: 12345,
              prompt: 'Find all appointments',
            },
          },
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            cancelledAppointments: JSON.stringify(appointmentsMock),
            explanation:
              '<h1>Found Appointments</h1>\n<p>I found 2 upcoming appointments:</p>\n<ul>\n<li>Video visit tomorrow</li>\n<li>Follow-up in 2 days</li>\n</ul>',
          },
          events: [
            {
              date: expect.any(String),
              text: {
                en: `2 appointments for patient 12345 were cancelled: 123, 456`,
              },
            },
          ],
        }),
          expect(onError).not.toHaveBeenCalled()
      })
    })
  })
})

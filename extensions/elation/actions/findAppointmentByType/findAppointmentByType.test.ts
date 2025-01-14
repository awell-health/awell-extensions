import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { findAppointmentByType as action } from './findAppointmentByType'
import { TestHelpers } from '@awell-health/extensions-core'
import { ChatOpenAI } from '@langchain/openai'

jest.mock('../../client')

// Mock the module
jest.mock('@langchain/openai', () => {
  const mockInvoke = jest.fn().mockResolvedValue({
    appointmentId: '123',
    explanation: 'Test explanation',
  })

  const mockChain = {
    invoke: mockInvoke,
  }

  const mockPipe = jest.fn().mockReturnValue(mockChain)

  const mockChatOpenAI = jest.fn().mockImplementation(() => ({
    pipe: mockPipe,
  }))

  return {
    ChatOpenAI: mockChatOpenAI,
  }
})

describe('Elation - Find appointment by type', () => {
  const {
    extensionAction: findAppointmentByType,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  test('Should return the correct appointment', async () => {
    await findAppointmentByType.onEvent({
      payload: {
        fields: {
          patientId: 12345, // used to get a list of appointments
          prompt: 'Find the next appointment for this patient',
        },
        settings: {
          client_id: 'clientId',
          client_secret: 'clientSecret',
          username: 'username',
          password: 'password',
          auth_url: 'authUrl',
          base_url: 'baseUrl',
          openAiApiKey: 'openaiApiKey',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(ChatOpenAI).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointment: JSON.stringify(        {
            id: 123,
            scheduled_date: '2025-01-15',
            status: 'scheduled',
            reason: 'follow-up',
            description: 'Follow-up appointment',
          }),
        explanation: 'Test explanation',
        appointmentExists: 'true',
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Number of future appointments for patient 12345: 3\nFound appointment: 123\nExplanation: Test explanation',
          },
        },
      ],
    })
  })
})

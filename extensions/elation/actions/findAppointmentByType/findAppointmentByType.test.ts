import { makeAPIClient } from '../../client'
import { appointmentsMock } from './__testdata__/GetAppointments.mock'
import { findAppointmentByType as action } from './findAppointmentByType'
import { TestHelpers } from '@awell-health/extensions-core'
import { ChatOpenAI } from '@langchain/openai'

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => ({
    findAppointments: jest.fn().mockResolvedValue(appointmentsMock),
  })),
}))

const mockedSdk = jest.mocked(makeAPIClient)

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
    expect(mockedSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointment: JSON.stringify(appointmentsMock[0]),
        explanation: 'Test explanation',
        appointmentExists: 'true',
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Number of future scheduled or confirmed appointments for patient 12345: 3\nFound appointment: 123\nExplanation: Test explanation',
          },
        },
      ],
    })
  })
})

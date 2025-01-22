import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { updatePatientTags as action } from './updatePatientTags'
import { TestHelpers } from '@awell-health/extensions-core'
import { ChatOpenAI } from '@langchain/openai'

jest.mock('../../client')

// Mock the module
jest.mock('@langchain/openai', () => {
  const mockInvoke = jest.fn().mockResolvedValue({
    updatedTags: ['test', 'test2'],
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

describe('Elation - Update patient tags', () => {
  const {
    extensionAction: updatePatientTags,
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

  test('Should return the correct letter', async () => {
    await updatePatientTags.onEvent({
      payload: {
        fields: {
          patientId: 123,
          prompt: 'Add the tags "test" and "test2"',
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
        updatedTags: 'test, test2',
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Previous patient tags: No tags\nUpdated patient tags: test, test2\nExplanation: Test explanation',
          },
        },
      ],
    })
  })

  test('Should use awell Open AI API key', async () => {
    await updatePatientTags.onEvent({
      payload: {
        fields: {
          patientId: 123,
          prompt: 'Add the tags "test" and "test2"',
        },
        settings: {
          client_id: 'clientId',
          client_secret: 'clientSecret',
          username: 'username',
          password: 'password',
          auth_url: 'authUrl',
          base_url: 'baseUrl',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(ChatOpenAI).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        updatedTags: 'test, test2',
      },
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Previous patient tags: No tags\nUpdated patient tags: test, test2\nExplanation: Test explanation',
          },
        },
      ],
    })
  })
})

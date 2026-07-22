import { TestHelpers } from '@awell-health/extensions-core'
import { BlandApiClient } from '../../../api/client'
import { createSmsConversation as action } from '../createSmsConversation'

const createResponse = {
  data: {
    conversation_id: 'conv-456',
    status: 'created',
  },
  errors: null,
}

const createSmsConversationMock = jest.fn().mockResolvedValue({
  data: createResponse,
})

jest.mock('../../../api/client', () => ({
  BlandApiClient: jest.fn().mockImplementation(() => ({
    createSmsConversation: createSmsConversationMock,
  })),
}))

const mockedSdk = jest.mocked(BlandApiClient)

describe('Bland.ai - Create SMS conversation', () => {
  const {
    extensionAction: createSmsConversation,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should create a conversation and auto-generate a message_sid', async () => {
    await createSmsConversation.onEvent({
      payload: {
        fields: {
          userNumber: '+12223334444',
          agentNumber: '+18162392019',
          message: 'Patient opted in to SMS reminders',
          sender: 'USER',
          currPathwayId: '0d726519-a4a3-47ba-9d55-c5a5181e29de',
        },
        settings: {
          apiKey: 'api-key',
        },
        patient: { id: 'patient-id' },
        pathway: { id: 'pathway-id', definition_id: 'definition-id' },
        activity: { id: 'activity-id' },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockedSdk).toHaveBeenCalled()

    const input = createSmsConversationMock.mock.calls[0][0]
    expect(input.message_sid).toEqual(expect.any(String))
    expect(input.message_sid.length).toBeGreaterThan(0)

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: {
          conversationId: 'conv-456',
          createResponse: JSON.stringify(createResponse),
        },
      }),
    )
  })
})

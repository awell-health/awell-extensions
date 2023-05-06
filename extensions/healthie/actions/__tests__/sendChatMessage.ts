import { getSdk } from "../../gql/sdk"
import { mockGetSdk, mockGetSdkReturn } from "../../gql/__mocks__/sdk"
import { sendChatMessage } from "../sendChatMessage"

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('sendChatMessage action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    (getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test("Should create a new message when it doesn't exist", async () => {
    await sendChatMessage.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          healthie_patient_id: 'patient-1',
          message: 'hello',
          provider_id: 'provider-1'
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url'
        },
      },
      onComplete,
      jest.fn(),
      {}
    )

    expect(mockGetSdkReturn.getConversationList).toHaveReturnedWith({ data: { conversationMemberships: [] } })
    expect(mockGetSdkReturn.createConversation).toHaveBeenCalled()
    expect(mockGetSdkReturn.sendChatMessage).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        conversationId: 'conversation-1'
      }
    })
  })

  test("Should not create a new message when it exists", async () => {
    (getSdk as jest.Mock).mockReturnValueOnce({
      ...mockGetSdkReturn,
      getConversationList: mockGetSdkReturn.getConversationList.mockReturnValueOnce({
        data: {
          conversationMemberships: [{
            convo: {
              id: 'conversation-2',
              owner: { id: 'provider-1' }
            }
          }] as any
        }
      })
    })
    await sendChatMessage.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          healthie_patient_id: 'patient-1',
          message: 'hello',
          provider_id: 'provider-1'
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url'
        },
      },
      onComplete,
      jest.fn(),
      {}
    )

    expect(mockGetSdkReturn.createConversation).not.toHaveBeenCalled()
    expect(mockGetSdkReturn.sendChatMessage).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        conversationId: 'conversation-2'
      }
    })
  })
})

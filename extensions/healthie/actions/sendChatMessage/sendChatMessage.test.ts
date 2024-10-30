import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { sendChatMessage } from '../sendChatMessage'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('sendChatMessage action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("Should create a new message when it doesn't exist", async () => {
    await sendChatMessage.onActivityCreated!(
      generateTestPayload({
        fields: {
          healthie_patient_id: 'patient-1',
          message: 'hello',
          provider_id: 'provider-1',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.getConversationList).toHaveReturnedWith({
      data: { conversationMemberships: [] },
    })
    expect(mockGetSdkReturn.createConversation).toHaveBeenCalled()
    expect(mockGetSdkReturn.sendChatMessage).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        conversationId: 'conversation-1',
      },
    })
  })

  test.skip('Should not create a new message when it exists', async () => {
    ;(getSdk as jest.Mock).mockReturnValueOnce({
      ...mockGetSdkReturn,
      getConversationList:
        mockGetSdkReturn.getConversationList.mockReturnValueOnce({
          data: {
            conversationMemberships: [
              {
                convo: {
                  id: 'conversation-2',
                  owner: { id: 'provider-1' },
                },
              },
            ] as any,
          },
        }),
    })
    await sendChatMessage.onActivityCreated!(
      generateTestPayload({
        fields: {
          healthie_patient_id: 'patient-1',
          message: 'hello',
          provider_id: 'provider-1',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.createConversation).not.toHaveBeenCalled()
    expect(mockGetSdkReturn.sendChatMessage).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        conversationId: 'conversation-2',
      },
    })
  })

  test.each([
    {
      input: {
        message:
          '<p class="slate-p">https://securestaging.gethealthie.com/appointments/embed_appt?dietitian_id=123&amp;provider_ids=[<span>123</span>]&amp;appt_type_ids=[19420]&amp;org_level=true</p>',
      },
      output: {
        message:
          '<p class="slate-p">https://securestaging.gethealthie.com/appointments/embed_appt?dietitian_id=123&amp;provider_ids=[123]&amp;appt_type_ids=[19420]&amp;org_level=true</p>',
      },
    },
    {
      input: {
        message: 'a normal non-html message without a <span> tag',
      },
      output: {
        message: 'a normal non-html message without a <span> tag',
      },
    },
    // This test highlights the problem with our current implementation, but it's good enough.
    {
      input: {
        message: '<div>a normal non-html message without a <span> tag</div>',
      },
      output: {
        message: '<div>a normal non-html message without a  tag</div>',
      },
    },
  ])('$#. Should correctly parse message', async ({ input, output }) => {
    ;(getSdk as jest.Mock).mockReturnValueOnce({
      ...mockGetSdkReturn,
      getConversationList:
        mockGetSdkReturn.getConversationList.mockReturnValueOnce({
          data: {
            conversationMemberships: [
              {
                convo: {
                  id: 'conversation-2',
                  owner: { id: 'provider-1' },
                },
              },
            ] as any,
          },
        }),
    })
    await sendChatMessage.onActivityCreated!(
      generateTestPayload({
        fields: {
          healthie_patient_id: 'patient-1',
          message: input.message,
          provider_id: 'provider-1',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.createConversation).not.toHaveBeenCalled()
    expect(mockGetSdkReturn.sendChatMessage).toHaveBeenCalledWith({
      input: expect.objectContaining({ content: output.message }),
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        conversationId: 'conversation-2',
      },
    })
  })
})

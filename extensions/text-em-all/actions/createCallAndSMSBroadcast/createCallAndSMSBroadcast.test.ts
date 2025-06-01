import { TestHelpers } from '@awell-health/extensions-core'
import { createCallAndSMSBroadcast } from './createCallAndSMSBroadcast'
import { TextEmAllClient } from '../../lib'
import { generateTestPayload } from '../../../../tests/constants'
import { CreateCallAndSMSBroadcastMockResponse } from './__testdata__/CreateCallAndSMSBroadcast.mock'

jest.mock('../../lib/client')

describe('CreateCallAndSMSBroadcast', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createCallAndSMSBroadcast)
  beforeEach(clearMocks)

  it('should call the TextEmAllClient with the correct data', async () => {
    const mockCreateCallBroadcast = jest
      .fn()
      .mockResolvedValue(CreateCallAndSMSBroadcastMockResponse)

    const mockedTextEmAllClient = jest.mocked(TextEmAllClient)

    mockedTextEmAllClient.mockImplementation(() => {
      return {
        createBroadcast: mockCreateCallBroadcast,
      } as unknown as TextEmAllClient
    })

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          broadcastName: 'testBroadcast',
          phoneNumber: '+15555550123',
          startDate: '2025-03-03T10:00:00Z',
          broadcastType: 'SMSAndAnnouncement',
          textMessage: 'This is a test text message. Please reply.',
        },
        settings: {
          customerKey: 'someCustomerKey',
          customerSecret: 'someCustomerSecret',
          token: 'someToken',
          baseUrl: 'https://staging-rest.call-em-all.com/v1',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockCreateCallBroadcast).toHaveBeenCalledWith({
      BroadcastName: 'testBroadcast',
      BroadcastType: 'SMSAndAnnouncement',
      TextMessage: 'This is a test text message. Please reply.',
      StartDate: '3/3/2025 10:00AM',
      Contacts: [{ PrimaryPhone: '(555) 555-0123' }],
    })
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})

import { TestHelpers } from '@awell-health/extensions-core'
import { createSMSBroadcast } from './createSMSBroadcast'
import { TextEmAllClient } from '../../lib'
import { generateTestPayload } from '../../../../tests/constants'
import { CreateSMSBroadcastMockResponse } from './__testdata__/CreateSMSBroadcast.mock'

jest.mock('../../lib/client')

describe('CreateSMSBroadcast', () => {
  const { 
    extensionAction, 
    onComplete, 
    onError, 
    helpers, 
    clearMocks
  } = TestHelpers.fromAction(createSMSBroadcast)
  beforeEach(clearMocks)

  it('should call the TextEmAllClient with the correct data', async () => {
    const mockCreateSMSBroadcast = jest
      .fn()
      .mockResolvedValue(CreateSMSBroadcastMockResponse)
      
    const mockedTextEmAllClient = jest.mocked(TextEmAllClient)

    mockedTextEmAllClient.mockImplementation(() => {
      return {
        createBroadcast: mockCreateSMSBroadcast,
      } as unknown as TextEmAllClient
    })

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          broadcastName: 'testBroadcast',
          phoneNumber: '5555550123',
          textMessage: 'This is a test text message. Please reply.',
          startDate: '2025-01-02 13:15:00-0000',
          textNumberID: 1234567890,
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

    expect(mockCreateSMSBroadcast).toHaveBeenCalledWith({
      BroadcastName: 'testBroadcast',
      BroadcastType: 'SMS',
      StartDate: '2025-01-02 13:15:00-0000',
      Contacts: [{ PrimaryPhone: '5555550123' }],
      TextMessage: 'This is a test text message. Please reply.',
      TextNumberID: 1234567890,
    })
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})

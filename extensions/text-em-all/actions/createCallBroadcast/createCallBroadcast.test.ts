import { TestHelpers } from '@awell-health/extensions-core'
import { createCallBroadcast } from './createCallBroadcast'
import { TextEmAllClient } from '../../lib'
import { generateTestPayload } from '../../../../tests/constants'
import { CreateCallBroadcastMockResponse } from './__testdata__/CreateCallBroadcast.mock'

jest.mock('../../lib/client')

describe('CreateCallBroadcast', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createCallBroadcast)
  beforeEach(clearMocks)

  it('should call the TextEmAllClient with the correct data', async () => {
    const mockCreateCallBroadcast = jest
      .fn()
      .mockResolvedValue(CreateCallBroadcastMockResponse)

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
          broadcastType: 'Announcement',
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
      BroadcastType: 'Announcement',
      StartDate: '3/3/2025 10:00AM',
      Contacts: [{ PrimaryPhone: '(555) 555-0123' }],
    })
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})

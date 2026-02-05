import { TestHelpers } from '@awell-health/extensions-core'
import { createSMSBroadcast } from './createSMSBroadcast'
import { TextEmAllClient } from '../../lib'
import { generateTestPayload } from '../../../../tests/constants'
import {
  CreateSMSBroadcastSuccessMockResponse,
  InvalidNumberMockResponse,
  RateLimitMockResponse,
  GenericErrorMockResponse,
} from './__testdata__/CreateSMSBroadcast.mock'
import { DeliveryResultType } from './config'

jest.mock('../../lib/client')

describe('CreateSMSBroadcast', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createSMSBroadcast)

  const defaultPayload = generateTestPayload({
    fields: {
      broadcastName: 'testBroadcast',
      phoneNumber: '+15555550123',
      textMessage: 'This is a test text message. Please reply.',
      startDate: '2025-03-03T10:00:00Z',
      textNumberID: 1234567890,
    },
    settings: {
      customerKey: 'someCustomerKey',
      customerSecret: 'someCustomerSecret',
      token: 'someToken',
      baseUrl: 'https://staging-rest.call-em-all.com/v1',
    },
  })

  beforeEach(clearMocks)

  it('should return sent result when broadcast is created successfully', async () => {
    const mockCreateBroadcast = jest
      .fn()
      .mockResolvedValue(CreateSMSBroadcastSuccessMockResponse)

    const mockedTextEmAllClient = jest.mocked(TextEmAllClient)
    mockedTextEmAllClient.mockImplementation(() => {
      return {
        createBroadcast: mockCreateBroadcast,
      } as unknown as TextEmAllClient
    })

    await extensionAction.onEvent({
      payload: defaultPayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockCreateBroadcast).toHaveBeenCalledWith({
      BroadcastName: 'testBroadcast',
      BroadcastType: 'SMS',
      StartDate: '3/3/2025 10:00AM',
      Contacts: [{ PrimaryPhone: '(555) 555-0123' }],
      TextMessage: 'This is a test text message. Please reply.',
      TextNumberID: 1234567890,
    })
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          broadcastId: '10006607',
          deliveryResult: DeliveryResultType.SENT,
          deliveryResultDetails: 'Message sent to carrier for delivery',
        }),
      }),
    )
  })

  it('should return invalid_number result when phone number is invalid or opted out', async () => {
    const mockCreateBroadcast = jest
      .fn()
      .mockResolvedValue(InvalidNumberMockResponse)

    const mockedTextEmAllClient = jest.mocked(TextEmAllClient)
    mockedTextEmAllClient.mockImplementation(() => {
      return {
        createBroadcast: mockCreateBroadcast,
      } as unknown as TextEmAllClient
    })

    await extensionAction.onEvent({
      payload: defaultPayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          deliveryResult: DeliveryResultType.INVALID_NUMBER,
          deliveryResultDetails:
            'Unable to create broadcast. None of the contacts are able to receive text messages.',
        }),
      }),
    )
  })

  it('should call onError when rate limited (429)', async () => {
    const mockCreateBroadcast = jest
      .fn()
      .mockResolvedValue(RateLimitMockResponse)

    const mockedTextEmAllClient = jest.mocked(TextEmAllClient)
    mockedTextEmAllClient.mockImplementation(() => {
      return {
        createBroadcast: mockCreateBroadcast,
      } as unknown as TextEmAllClient
    })

    await extensionAction.onEvent({
      payload: defaultPayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        events: expect.arrayContaining([
          expect.objectContaining({
            error: expect.objectContaining({
              category: 'SERVER_ERROR',
              message: 'Rate limit exceeded (429)',
            }),
          }),
        ]),
      }),
    )
  })

  it('should return failed result for other API errors', async () => {
    const mockCreateBroadcast = jest
      .fn()
      .mockResolvedValue(GenericErrorMockResponse)

    const mockedTextEmAllClient = jest.mocked(TextEmAllClient)
    mockedTextEmAllClient.mockImplementation(() => {
      return {
        createBroadcast: mockCreateBroadcast,
      } as unknown as TextEmAllClient
    })

    await extensionAction.onEvent({
      payload: defaultPayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          deliveryResult: DeliveryResultType.FAILED,
          deliveryResultDetails: 'Something went wrong',
        }),
      }),
    )
  })
})

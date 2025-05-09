import { TestHelpers } from '@awell-health/extensions-core'
import { sendEmailWithAttributes } from './sendEmailWithAttributes'
import { BrazeClient } from '../../client'
import { generateTestPayload } from '../../../../tests/constants'

jest.mock('../../client')

const mockSendEmailWithAttributes = jest
  .spyOn(BrazeClient.prototype, 'sendEmailWithAttributes')
  .mockImplementation(() => {
    return Promise.resolve({
      dispatch_id: '123',
      message: 'success',
    })
  })

describe('sendEmailWithAttributes', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendEmailWithAttributes)
  beforeEach(clearMocks)

  it('should call the BrazeClient with the correct data when externalUserId is provided', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          externalUserId: '456',
          campaignId: '123',
          triggerProperties: {
            property1: 'value1',
          },
          attributes: {
            attribute1: 'value1',
          },
        },
        settings: {
          apiKey: 'someApiKey',
          baseUrl: 'someBaseUrl',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockSendEmailWithAttributes).toHaveBeenCalledWith({
      campaign_id: '123',
      recipients: [
        {
          external_user_id: '456',
          trigger_properties: {
            property1: 'value1',
          },
          attributes: {
            attribute1: 'value1',
          },
        },
      ],
    })
  })

  it('should call the BrazeClient with the correct data when email is provided', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          email: 'test@test.com',
          campaignId: '123',
          triggerProperties: {
            property1: 'value1',
          },
        },
        settings: {
          apiKey: 'someApiKey',
          baseUrl: 'someBaseUrl',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockSendEmailWithAttributes).toHaveBeenCalledWith({
      campaign_id: '123',
      recipients: [
        {
          email: 'test@test.com',
          trigger_properties: {
            property1: 'value1',
          },
        },
      ],
    })
  })

  it('should throw an error when neither externalUserId nor email is provided', async () => {
    const promise = extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          campaignId: '123',
          triggerProperties: {
            property1: 'value1',
          },
        },
        settings: {
          apiKey: 'someApiKey',
          baseUrl: 'someBaseUrl',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    await expect(promise).rejects.toThrow(
      'Either externalUserId or email must be provided.',
    )
  })
})

import { TestHelpers } from '@awell-health/extensions-core'
import { sendSMS } from './sendSMS'
import { BrazeClient } from '../../lib/api/client'
import { generateTestPayload } from '../../../../tests/constants'

jest.mock('../../lib/api/client')

const mocksendSMS = jest
  .spyOn(BrazeClient.prototype, 'sendMessageImmediately')
  .mockImplementation(() => {
    return Promise.resolve({
      dispatch_id: '123',
    })
  })

describe('sendSMS', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendSMS)
  beforeEach(clearMocks)

  it('should call the BrazeClient with the correct data', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          subscriptionGroupId: '123',
          externalUserId: '456',
          body: 'Hello, this is a test message',
          appId: '789',
          linkShorteningEnabled: true,
          useClickTrackingEnabled: true,
          campaignId: '123',
          messageVariantionId: '456',
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

    expect(mocksendSMS).toHaveBeenCalledWith({
      external_user_ids: ['456'],
      campaign_id: '123',
      messages: {
        sms: {
          subscription_group_id: '123',
          body: 'Hello, this is a test message',
          app_id: '789',
          message_variation_id: '456',
          link_shortening_enabled: true,
          use_click_tracking_enabled: true,
        },
      },
    })
  })
})

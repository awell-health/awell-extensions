import { TestHelpers } from '@awell-health/extensions-core'
import { scheduleSMS } from './scheduleSMS'
import { BrazeClient } from '../../lib/api/client'
import { generateTestPayload } from '../../../../tests/constants'

jest.mock('../../lib/api/client')

const mockScheduleSMS = jest
  .spyOn(BrazeClient.prototype, 'scheduleMessage')
  .mockImplementation(() => {
    return Promise.resolve({
      dispatch_id: '123',
      schedule_id: '456',
      message: 'success',
    })
  })

describe('scheduleSMS', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(scheduleSMS)
  beforeEach(clearMocks)

  it('should call the BrazeClient with the correct data', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          subscriptionGroupId: '123',
          externalUserId: '456',
          body: 'Hello, this is a test message',
          appId: '789',
          scheduleTime: '2024-03-20T10:00:00Z',
          inPatientLocalTime: true,
          atOptimalTime: true,
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

    expect(mockScheduleSMS).toHaveBeenCalledWith({
      external_user_ids: ['456'],
      campaign_id: '123',
      schedule: {
        time: '2024-03-20T10:00:00Z',
        in_local_time: true,
        at_optimal_time: true,
      },
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

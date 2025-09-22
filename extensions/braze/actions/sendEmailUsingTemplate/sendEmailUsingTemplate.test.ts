import { TestHelpers } from '@awell-health/extensions-core'
import { sendEmailUsingTemplate } from './sendEmailUsingTemplate'
import { BrazeClient } from '../../lib/api/client'
import { generateTestPayload } from '../../../../tests/constants'

jest.mock('../../lib/api/client')

const mockScheduleEmail = jest
  .spyOn(BrazeClient.prototype, 'scheduleMessage')
  .mockImplementation(() => {
    return Promise.resolve({
      dispatch_id: '123',
      schedule_id: '456',
      message: 'success',
    })
  })

const mockSendMessageImmediately = jest
  .spyOn(BrazeClient.prototype, 'sendMessageImmediately')
  .mockImplementation(() => {
    return Promise.resolve({
      dispatch_id: '123',
    })
  })

describe('sendEmailUsingTemplate', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendEmailUsingTemplate)
  beforeEach(clearMocks)

  it('should call the BrazeClient with the correct data and schedule the email', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          externalUserId: '456',
          appId: '789',
          from: 'Test From <test@test.com>',
          replyTo: 'reply@test.com',
          templateId: '123',
          preheader: 'Test Preheader',
          scheduleTime: '2024-03-20T10:00:00Z',
          inPatientLocalTime: true,
          atOptimalTime: false,
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
      attempt: 1,
    })

    expect(mockScheduleEmail).toHaveBeenCalledWith({
      external_user_ids: ['456'],
      schedule: {
        time: '2024-03-20T10:00:00Z',
        in_local_time: true,
        at_optimal_time: false,
      },
      campaign_id: '123',
      messages: {
        email: {
          from: 'Test From <test@test.com>',
          app_id: '789',
          email_template_id: '123',
          message_variation_id: '456',
          reply_to: 'reply@test.com',
          preheader: 'Test Preheader',
        },
      },
    })
  })

  it('should call the BrazeClient with the correct data and send the email immediately', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          externalUserId: '456',
          appId: '789',
          from: 'Test From <test@test.com>',
          replyTo: 'reply@test.com',
          templateId: '123',
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
      attempt: 1,
    })

    expect(mockSendMessageImmediately).toHaveBeenCalledWith({
      external_user_ids: ['456'],
      campaign_id: '123',
      messages: {
        email: {
          from: 'Test From <test@test.com>',
          app_id: '789',
          email_template_id: '123',
          message_variation_id: '456',
          reply_to: 'reply@test.com',
        },
      },
    })
  })
})

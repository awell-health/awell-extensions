import { TestHelpers } from '@awell-health/extensions-core'
import { sendEmail } from './sendEmail'
import { BrazeClient } from '../../lib/api/client'
import { generateTestPayload } from '../../../../tests/constants'

jest.mock('../../lib/api/client')

const mockSendEmail = jest
  .spyOn(BrazeClient.prototype, 'sendMessageImmediately')
  .mockImplementation(() => {
    return Promise.resolve({
      dispatch_id: '123',
    })
  })

describe('sendEmail', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendEmail)
  beforeEach(clearMocks)

  it('should call the BrazeClient with the correct data', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          externalUserId: '456',
          appId: '789',
          from: 'Test From <test@test.com>',
          replyTo: 'reply@test.com',
          subject: 'Test Subject',
          body: 'Hello, this is a test message',
          preheader: 'Test Preheader',
          shouldInlineCss: false,
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

    expect(mockSendEmail).toHaveBeenCalledWith({
      external_user_ids: ['456'],
      campaign_id: '123',
      messages: {
        email: {
          from: 'Test From <test@test.com>',
          body: 'Hello, this is a test message',
          app_id: '789',
          message_variation_id: '456',
          reply_to: 'reply@test.com',
          subject: 'Test Subject',
          preheader: 'Test Preheader',
          should_inline_css: false,
        },
      },
    })
  })
})

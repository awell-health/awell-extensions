import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { sendEmailWithSmtp } from '.'
import { HubSpotSMTPClient } from '../../lib/smtpApi/smtpClient'

jest.mock('../../lib/smtpApi/smtpClient', () => {
  return {
    HubSpotSMTPClient: jest.fn().mockImplementation(() => {
      return {
        sendEmail: jest.fn().mockResolvedValue(undefined),
      }
    }),
  }
})

const mockedHubSpotSmtpSdk = jest.mocked(HubSpotSMTPClient)

describe('HubSpot - Send email with SMTP', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(sendEmailWithSmtp)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          from: 'from',
          to: 'to',
          subject: 'subject',
          message: 'message',
        },
        settings: {
          accessToken: 'accessToken',
          smtpUsername: 'username',
          smtpPassword: 'password',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHubSpotSmtpSdk).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})

import { smsNotification } from '../'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Simple sms notification action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(smsNotification)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await smsNotification.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: undefined,
          clientId: undefined,
          region: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onError callback', async () => {
    await smsNotification.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: undefined,
          clientId: undefined,
          region: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})

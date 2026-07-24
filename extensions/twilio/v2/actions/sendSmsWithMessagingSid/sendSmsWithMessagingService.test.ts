import { sendSmsWithMessagingService } from './sendSmsWithMessagingService'
import twilioSdk from '../../../common/sdk/twilio'
import { generateTestPayload } from '@/tests'
import { ZodError } from 'zod'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Send SMS (with Messaging Service) action', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    sendSmsWithMessagingService,
  )
  const getLastTwilioClient = (): any =>
    (twilioSdk as any as jest.Mock<typeof twilioSdk>).mock.results.at(-1)?.value

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendSmsWithMessagingService.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
          messagingServiceSid: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: undefined,
          clientId: undefined,
          region: undefined,
          messagingServiceSid: 'service-id-settings',
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

  test('Should call the onError callback when there is no recipient', async () => {
    const resp = sendSmsWithMessagingService.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '',
          messagingServiceSid: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: undefined,
          clientId: undefined,
          region: undefined,
          messagingServiceSid: 'service-id-settings',
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
    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no message', async () => {
    const resp = sendSmsWithMessagingService.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: '',
          recipient: '+19144542596',
          messagingServiceSid: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: undefined,
          clientId: undefined,
          region: undefined,
          messagingServiceSid: 'service-id-settings',
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
    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  describe("'Messaging Service SID'", () => {
    const basePayload = generateTestPayload({
      fields: {
        message: 'Message content',
        recipient: '+32494000000',
        messagingServiceSid: 'service-id-fields',
      },
      settings: {
        accountSid: 'AC-accountSid',
        authToken: 'authToken',
        fromNumber: undefined,
        messagingServiceSid: 'service-id-settings',
        addOptOutLanguage: undefined,
        clientId: undefined,
        region: undefined,
        optOutLanguage: undefined,
        language: undefined,
      },
    })

    test('Should use one provided in action fields', async () => {
      await sendSmsWithMessagingService.onEvent!({
        payload: basePayload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
      expect(
        getLastTwilioClient().messages.create.mock.calls.at(-1)[0]
          .messagingServiceSid,
      ).toEqual(basePayload.fields.messagingServiceSid)
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })

    test('Should fallback to settings if no messagingServiceSid is provided', async () => {
      const payloadWithoutFrom = {
        ...basePayload,
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
          messagingServiceSid: undefined,
        },
      }

      await sendSmsWithMessagingService.onEvent!({
        payload: payloadWithoutFrom,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
      expect(
        getLastTwilioClient().messages.create.mock.calls.at(-1)[0]
          .messagingServiceSid,
      ).toEqual(payloadWithoutFrom.settings.messagingServiceSid)
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })

    test('Should throw error if no messagingServiceSid is provided in both settings and fields', async () => {
      const payloadWithoutFrom = {
        ...basePayload,
        settings: { ...basePayload.settings, messagingServiceSid: undefined },
        fields: {
          ...basePayload.fields,
          messagingServiceSid: undefined,
        },
      }

      const resp = sendSmsWithMessagingService.onEvent!({
        payload: payloadWithoutFrom,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
      await expect(resp).rejects.toThrow(ZodError)
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})

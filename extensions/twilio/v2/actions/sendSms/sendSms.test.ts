import { sendSms } from './sendSms'
import twilioSdk from '../../../common/sdk/twilio'
import { generateTestPayload } from '@/tests'
import { ZodError } from 'zod'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Send SMS (with from number) action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendSms)
  const getLastTwilioClient = (): any =>
    (twilioSdk as any as jest.Mock<typeof twilioSdk>).mock.results.at(-1)?.value

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
          from: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          clientId: undefined,
          messagingServiceSid: undefined,
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

  test('Should call the onError callback when there is no recipient', async () => {
    const resp = sendSms.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '',
          from: '',
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
    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no message', async () => {
    const resp = sendSms.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: '',
          recipient: '+19144542596',
          from: '',
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
    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  describe("'From' number", () => {
    const basePayload = generateTestPayload({
      fields: {
        message: 'Message content',
        recipient: '+32494000000',
        from: '+32494000000',
      },
      settings: {
        accountSid: 'AC-accountSid',
        authToken: 'authToken',
        fromNumber: '+19144542596',
        messagingServiceSid: undefined,
        addOptOutLanguage: undefined,
        clientId: undefined,
        region: undefined,
        optOutLanguage: undefined,
        language: undefined,
      },
    })

    test('Should use one provided in action fields', async () => {
      await sendSms.onEvent!({
        payload: basePayload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
      expect(
        getLastTwilioClient().messages.create.mock.calls.at(-1)[0].from,
      ).toEqual(basePayload.fields.from)
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })

    test('Should fallback to settings if no number is provided', async () => {
      const payloadWithoutFrom = {
        ...basePayload,
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
          from: undefined,
        },
      }

      await sendSms.onEvent!({
        payload: payloadWithoutFrom,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
      expect(
        getLastTwilioClient().messages.create.mock.calls.at(-1)[0].from,
      ).toEqual(payloadWithoutFrom.settings.fromNumber)
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })

    test('Should throw error if no number is provided in both settings and fields', async () => {
      const payloadWithoutFrom = {
        ...basePayload,
        settings: { ...basePayload.settings, fromNumber: undefined },
        fields: {
          ...basePayload.fields,
          from: undefined,
        },
      }

      const resp = sendSms.onEvent!({
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

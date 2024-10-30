import { sendSms } from './sendSms'
import twilioSdk from '../../../common/sdk/twilio'
import { generateTestPayload } from '@/tests'
import { ZodError } from 'zod'

describe('Send SMS (with from number) action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const getLastTwilioClient = (): any =>
    (twilioSdk as any as jest.Mock<typeof twilioSdk>).mock.results.at(-1)?.value

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onActivityCreated!(
      generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
          from: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no recipient', async () => {
    const resp = sendSms.onActivityCreated!(
      generateTestPayload({
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
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no message', async () => {
    const resp = sendSms.onActivityCreated!(
      generateTestPayload({
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
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
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
        optOutLanguage: undefined,
        language: undefined,
      },
    })

    test('Should use one provided in action fields', async () => {
      await sendSms.onActivityCreated!(basePayload, onComplete, onError)
      expect(
        getLastTwilioClient().messages.create.mock.calls.at(-1)[0].from
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

      await sendSms.onActivityCreated!(payloadWithoutFrom, onComplete, onError)
      expect(
        getLastTwilioClient().messages.create.mock.calls.at(-1)[0].from
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

      const resp = sendSms.onActivityCreated!(
        payloadWithoutFrom,
        onComplete,
        onError
      )
      await expect(resp).rejects.toThrow(ZodError)
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})

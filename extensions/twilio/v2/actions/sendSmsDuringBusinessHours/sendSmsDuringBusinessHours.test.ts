import { sendSmsDuringBusinessHours } from './sendSmsDuringBusinessHours'
import twilioSdk from '../../../common/sdk/twilio'
import { generateTestPayload } from '@/tests'
import { ZodError } from 'zod'

describe('Send SMS during business hours', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const getLastTwilioClient = (): any =>
    (twilioSdk as any as jest.Mock<typeof twilioSdk>).mock.results.at(-1)?.value

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('Should call the onComplete callback and not schedule the message if current date is between business hours', async () => {
    const mockDate = '2024-01-01T10:00:00Z' // between business hours
    jest.setSystemTime(new Date(mockDate))

    await sendSmsDuringBusinessHours.onActivityCreated!(
      generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
          messagingServiceSid: '',
          timeZone: undefined,
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: 'service-id-settings',
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        scheduled: 'false', // message will be sent immediately
        sendAt: mockDate,
        messageSid: '123',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and schedule the message if current date is before business hours', async () => {
    const mockDate = '2024-01-01T08:59:00Z' // before business hours
    jest.setSystemTime(new Date(mockDate))

    await sendSmsDuringBusinessHours.onActivityCreated!(
      generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
          messagingServiceSid: '',
          timeZone: undefined,
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: 'service-id-settings',
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        scheduled: 'true',
        sendAt: '2024-01-01T09:00:00Z', // scheduled for 9 AM the same day
        messageSid: '123',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and schedule the message if current date is after business hours', async () => {
    const mockDate = '2024-01-01T17:01:00Z' // after business hours
    jest.setSystemTime(new Date(mockDate))

    await sendSmsDuringBusinessHours.onActivityCreated!(
      generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
          messagingServiceSid: '',
          timeZone: undefined,
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: 'service-id-settings',
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        scheduled: 'true',
        sendAt: '2024-01-02T09:00:00Z', // scheduled for 9 AM the next day
        messageSid: '123',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no recipient', async () => {
    const resp = sendSmsDuringBusinessHours.onActivityCreated!(
      generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '',
          messagingServiceSid: '',
          timeZone: undefined,
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: undefined,
          messagingServiceSid: 'service-id-settings',
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
    const resp = sendSmsDuringBusinessHours.onActivityCreated!(
      generateTestPayload({
        fields: {
          message: '',
          recipient: '+19144542596',
          messagingServiceSid: '',
          timeZone: undefined,
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: undefined,
          messagingServiceSid: 'service-id-settings',
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

  describe("'Messaging Service SID'", () => {
    const basePayload = generateTestPayload({
      fields: {
        message: 'Message content',
        recipient: '+32494000000',
        messagingServiceSid: 'service-id-fields',
        timeZone: undefined,
      },
      settings: {
        accountSid: 'AC-accountSid',
        authToken: 'authToken',
        fromNumber: undefined,
        messagingServiceSid: 'service-id-settings',
        addOptOutLanguage: undefined,
        optOutLanguage: undefined,
        language: undefined,
      },
    })

    test('Should use one provided in action fields', async () => {
      await sendSmsDuringBusinessHours.onActivityCreated!(
        basePayload,
        onComplete,
        onError
      )
      expect(
        getLastTwilioClient().messages.create.mock.calls.at(-1)[0]
          .messagingServiceSid
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
          timeZone: undefined,
        },
      }

      await sendSmsDuringBusinessHours.onActivityCreated!(
        payloadWithoutFrom,
        onComplete,
        onError
      )
      expect(
        getLastTwilioClient().messages.create.mock.calls.at(-1)[0]
          .messagingServiceSid
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
          timeZone: undefined,
        },
      }

      const resp = sendSmsDuringBusinessHours.onActivityCreated!(
        payloadWithoutFrom,
        onComplete,
        onError
      )
      await expect(resp).rejects.toThrow(ZodError)
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})

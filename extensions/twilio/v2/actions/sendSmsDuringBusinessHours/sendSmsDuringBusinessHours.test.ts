import { sendSmsDuringBusinessHours } from './sendSmsDuringBusinessHours'
import twilioSdk from '../../../common/sdk/twilio'
import { generateTestPayload } from '@/tests'
import { ZodError } from 'zod'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Send SMS during business hours', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    sendSmsDuringBusinessHours,
  )
  const getLastTwilioClient = (): any =>
    (twilioSdk as any as jest.Mock<typeof twilioSdk>).mock.results.at(-1)?.value

  beforeEach(() => {
    clearMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('Should call the onComplete callback and not schedule the message if current date is between business hours', async () => {
    const mockDate = '2024-01-01T10:00:00Z' // between business hours
    jest.setSystemTime(new Date(mockDate))

    await sendSmsDuringBusinessHours.onEvent!({
      payload: generateTestPayload({
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
          region: undefined,
          clientId: 'clientId',
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

    await sendSmsDuringBusinessHours.onEvent!({
      payload: generateTestPayload({
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
          region: undefined,
          messagingServiceSid: 'service-id-settings',
          addOptOutLanguage: undefined,
          clientId: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
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

    await sendSmsDuringBusinessHours.onEvent!({
      payload: generateTestPayload({
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
          region: undefined,
          messagingServiceSid: 'service-id-settings',
          addOptOutLanguage: undefined,
          clientId: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
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
    const resp = sendSmsDuringBusinessHours.onEvent!({
      payload: generateTestPayload({
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
          clientId: undefined,
          region: undefined,
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
    const resp = sendSmsDuringBusinessHours.onEvent!({
      payload: generateTestPayload({
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
          clientId: undefined,
          region: undefined,
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
        timeZone: undefined,
      },
      settings: {
        accountSid: 'AC-accountSid',
        authToken: 'authToken',
        fromNumber: undefined,
        messagingServiceSid: 'service-id-settings',
        addOptOutLanguage: undefined,
        clientId: undefined,
        region: 'US1',
        optOutLanguage: undefined,
        language: undefined,
      },
    })

    test('Should use one provided in action fields', async () => {
      await sendSmsDuringBusinessHours.onEvent!({
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
          timeZone: undefined,
        },
      }

      await sendSmsDuringBusinessHours.onEvent!({
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
          timeZone: undefined,
        },
      }

      const resp = sendSmsDuringBusinessHours.onEvent!({
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

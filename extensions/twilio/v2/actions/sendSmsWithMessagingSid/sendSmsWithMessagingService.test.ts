import { sendSmsWithMessagingService } from './sendSmsWithMessagingService'
import twilioSdk from '../../../common/sdk/twilio'
import { generateTestPayload } from '../../../../../src/tests'
import { ZodError } from 'zod'

describe('Send SMS (with Messaging Service) action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const getLastTwilioClient = (): any =>
    (twilioSdk as any as jest.Mock<typeof twilioSdk>).mock.results.at(-1)?.value

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendSmsWithMessagingService.onActivityCreated(
      generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+32494000000',
          messagingServiceSid: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: undefined,
          messagingServiceSid: 'service-id-settings',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should throw when there is no recipient', async () => {
    expect.assertions(2)
    expect(onComplete).not.toHaveBeenCalled()
    try {
      await sendSmsWithMessagingService.onActivityCreated(
        generateTestPayload({
          fields: {
            message: 'Message content',
            recipient: '',
            messagingServiceSid: '',
          },
          settings: {
            accountSid: 'AC-accountSid',
            authToken: 'authToken',
            fromNumber: undefined,
            messagingServiceSid: 'service-id-settings',
          },
        }),
        onComplete,
        onError
      )
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError)
    }
  })

  test('Should throw when there is no message', async () => {
    expect.assertions(2)
    expect(onComplete).not.toHaveBeenCalled()
    try {
      await sendSmsWithMessagingService.onActivityCreated(
        generateTestPayload({
          fields: {
            message: '',
            recipient: '+19144542596',
            messagingServiceSid: '',
          },
          settings: {
            accountSid: 'AC-accountSid',
            authToken: 'authToken',
            fromNumber: undefined,
            messagingServiceSid: 'service-id-settings',
          },
        }),
        onComplete,
        onError
      )
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError)
    }
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
      },
    })

    test('Should use one provided in action fields', async () => {
      await sendSmsWithMessagingService.onActivityCreated(
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
        },
      }

      await sendSmsWithMessagingService.onActivityCreated(
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
      expect.assertions(2)
      const payloadWithoutFrom = {
        ...basePayload,
        settings: { ...basePayload.settings, messagingServiceSid: undefined },
        fields: {
          ...basePayload.fields,
          messagingServiceSid: undefined,
        },
      }

      try {
        await sendSmsWithMessagingService.onActivityCreated(
          payloadWithoutFrom,
          onComplete,
          onError
        )
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError)
      }
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})

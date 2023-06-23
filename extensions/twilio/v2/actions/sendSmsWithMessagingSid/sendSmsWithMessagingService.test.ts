import { sendSmsWithMessagingService } from './sendSmsWithMessagingService'
import twilioSdk from '../../../common/sdk/twilio'

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
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
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
      },
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no recipient', async () => {
    await sendSmsWithMessagingService.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
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
      },
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no message', async () => {
    await sendSmsWithMessagingService.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
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
      },
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  describe("'Messaging Service SID'", () => {
    const basePayload = {
      pathway: {
        id: 'pathway-id',
        definition_id: 'pathway-definition-id',
      },
      activity: {
        id: 'activity-id',
      },
      patient: { id: 'test-patient' },
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
    }

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
      const payloadWithoutFrom = {
        ...basePayload,
        settings: { ...basePayload.settings, messagingServiceSid: undefined },
        fields: {
          ...basePayload.fields,
          messagingServiceSid: undefined,
        },
      }

      await sendSmsWithMessagingService.onActivityCreated(
        payloadWithoutFrom,
        onComplete,
        onError
      )
      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          expect.objectContaining({
            error: {
              category: 'BAD_REQUEST',
              message:
                'Validation error: "Messaging Service SID" is missing in both settings and fields',
            },
          }),
        ]),
      })
    })
  })
})

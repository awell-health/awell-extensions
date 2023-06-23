import { sendSms } from './sendSms'
import twilioSdk from '../../../common/sdk/twilio'

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
    await sendSms.onActivityCreated(
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
          from: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: undefined,
        },
      },
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no recipient', async () => {
    await sendSms.onActivityCreated(
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
          from: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: undefined,
        },
      },
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no message', async () => {
    await sendSms.onActivityCreated(
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
          from: '',
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: undefined,
        },
      },
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  describe("'From' number", () => {
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
        from: '+32494000000',
      },
      settings: {
        accountSid: 'AC-accountSid',
        authToken: 'authToken',
        fromNumber: '+19144542596',
        messagingServiceSid: undefined,
      },
    }

    test('Should use one provided in action fields', async () => {
      await sendSms.onActivityCreated(basePayload, onComplete, onError)
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

      await sendSms.onActivityCreated(payloadWithoutFrom, onComplete, onError)
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

      await sendSms.onActivityCreated(payloadWithoutFrom, onComplete, onError)
      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          expect.objectContaining({
            error: {
              category: 'BAD_REQUEST',
              message:
                'Validation error: "From" number is missing in both settings and in the action field.',
            },
          }),
        ]),
      })
    })
  })
})

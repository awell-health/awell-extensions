import { FieldType, TestHelpers } from '@awell-health/extensions-core'
import { ZodError } from 'zod'
import { BlandApiClient } from '../api/client'
import { sendCall } from '../actions/sendCall/sendCall'
import { sendCallWithPathway } from '../actions/sendCallWithPathway'
import * as sendCallConfig from '../actions/sendCall/config'
import * as sendCallWithPathwayConfig from '../actions/sendCallWithPathway/config'

const actions = [
  {
    name: 'sendCall',
    action: sendCall,
    config: sendCallConfig,
    baseFields: { phoneNumber: '+12133734253', task: 'Some task' },
  },
  {
    name: 'sendCallWithPathway',
    action: sendCallWithPathway,
    config: sendCallWithPathwayConfig,
    baseFields: { phoneNumber: '+12133734253', pathwayId: 'pathwayId' },
  },
]

describe.each(actions)(
  'Bland - $name voicemail action',
  ({ action, config, baseFields }) => {
    const { fields, FieldsValidationSchema } = config

    test('is a dropdown of hangup, leave_message and ignore', () => {
      expect(fields.voicemail_action.type).toBe(FieldType.STRING)
      const values = fields.voicemail_action.options?.dropdownOptions?.map(
        (o) => o.value,
      )
      expect(values).toEqual(['hangup', 'leave_message', 'ignore'])
      values?.forEach((value) => {
        expect(
          FieldsValidationSchema.parse({
            ...baseFields,
            voicemail_action: value,
          }).voicemail_action,
        ).toBe(value)
      })
    })

    test('parses a missing field as undefined', () => {
      expect(
        FieldsValidationSchema.parse(baseFields).voicemail_action,
      ).toBeUndefined()
    })

    // Legacy values were saved while the field was a JSON input
    test.each([
      [undefined, undefined],
      ['', undefined],
      ['  ', undefined],
      ['{}', undefined],
      [' {} ', undefined],
      ['"ignore"', 'ignore'],
      ['"hangup"', 'hangup'],
      ['"leave_message"', 'leave_message'],
    ])('parses %j as %j', (input, expected) => {
      expect(
        FieldsValidationSchema.parse({ ...baseFields, voicemail_action: input })
          .voicemail_action,
      ).toBe(expected)
    })

    test.each(['{"voicemail_action":"ignore"}', 'voicemail', '"ignore', '""'])(
      'rejects %j',
      (input) => {
        expect(() =>
          FieldsValidationSchema.parse({
            ...baseFields,
            voicemail_action: input,
          }),
        ).toThrow(ZodError)
      },
    )

    describe('when the action runs', () => {
      let sendCallSpy: jest.SpyInstance
      const { extensionAction, onComplete, onError, helpers, clearMocks } =
        TestHelpers.fromAction(action)

      beforeEach(() => {
        clearMocks()
        jest.clearAllMocks()
        sendCallSpy = jest
          .spyOn(BlandApiClient.prototype, 'sendCall')
          .mockResolvedValue({
            data: {
              status: 'success',
              call_id: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
            },
          } as any)
      })

      const run = async (voicemail_action: string): Promise<void> => {
        await extensionAction.onEvent({
          payload: {
            fields: { ...baseFields, voicemail_action },
            patient: { id: 'patient-id' },
            pathway: {
              id: 'pathway-id',
              definition_id: 'pathway-definition-id',
              tenant_id: '123',
            },
            activity: { id: 'activity-id' },
            settings: { apiKey: 'api-key' },
          } as any,
          onComplete,
          onError,
          helpers,
          attempt: 1,
        })
      }

      test.each(['{}', ''])(
        'sends no voicemail_action to Bland for %j',
        async (input) => {
          await run(input)
          expect(onError).not.toHaveBeenCalled()
          expect(onComplete).toHaveBeenCalled()
          // The key may be present as undefined; JSON serialisation drops it from the request body
          const body = JSON.parse(JSON.stringify(sendCallSpy.mock.calls[0][0]))
          expect(body).not.toHaveProperty('voicemail_action')
        },
      )

      test('sends ignore to Bland for a quoted "ignore"', async () => {
        await run('"ignore"')
        expect(onError).not.toHaveBeenCalled()
        expect(sendCallSpy).toHaveBeenCalledWith(
          expect.objectContaining({ voicemail_action: 'ignore' }),
        )
      })

      test('errors without calling Bland for a JSON object', async () => {
        await run('{"voicemail_action":"ignore"}')
        expect(sendCallSpy).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalled()
      })
    })
  },
)

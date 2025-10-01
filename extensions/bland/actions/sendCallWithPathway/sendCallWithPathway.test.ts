import { sendCallWithPathway as action } from '.'
import { TestHelpers } from '@awell-health/extensions-core'
import { FieldsValidationSchema } from './config/fields'
import { ZodError } from 'zod'
import { BlandApiClient } from '../../api/client'
import { SendCallInputSchema } from '../../api/schema'

const mockedCallResponse = async () => {
  return {
    data: {
      status: 'success',
      call_id: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
    },
  } as any
}

describe('Bland - Send call with pathway', () => {
  let sendCallSpy: jest.SpyInstance
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    sendCallSpy = jest
      .spyOn(BlandApiClient.prototype, 'sendCall')
      .mockImplementation(mockedCallResponse)
  })

  describe('Action fields validation', () => {
    it('should fail if pathway ID is missing', async () => {
      expect(() =>
        FieldsValidationSchema.parse({
          phoneNumber: '+12133734253',
        }),
      ).toThrow(ZodError)
    })

    it('should successfully parse action fields', async () => {
      const parsedFields = FieldsValidationSchema.parse({
        phoneNumber: '+12133734253',
        pathwayId: 'pathwayId',
        requestData: JSON.stringify({
          name: 'John Doe',
        }),
        pathwayVersion: 1,
        voice: 'John',
        background_track: 'office',
        first_sentence: 'Hello',
        wait_for_greeting: 'true',
        block_interruptions: 'true',
        interruption_threshold: 10,
        model: 'base',
        temperature: 0.5,
        dynamic_data: JSON.stringify([
          {
            url: 'endpoint',
            method: 'GET',
            body: [],
            headers: [
              {
                key: 'Content-Type',
                value: 'application/json',
              },
            ],
            query: [],
            cache: true,
            response_data: [
              {
                context: '',
                data: '$',
                name: '',
              },
            ],
          },
        ]),
        keywords: 'keyword-1 ,  keyword-2  ',
        pronunciation_guide: JSON.stringify([
          {
            word: 'example',
            pronunciation: 'ex-am-ple',
            case_sensitive: 'false',
            spaced: 'false',
          },
          {
            word: 'API',
            pronunciation: 'A P I',
            case_sensitive: 'true',
            spaced: 'true',
          },
        ]),
        language: 'en-US',
        local_dialing: 'true',
        voicemail_sms: JSON.stringify({
          to: '+18001234567',
          message: 'You have a new voicemail!',
        }),
        dispatch_hours: JSON.stringify({
          start: '09:00',
          end: '17:00',
        }),
        sensitive_voicemail_detection: 'true',
        noise_cancellation: 'true',
        ignore_button_press: 'true',
        timezone: 'America/New_York',
        tools: JSON.stringify([
          {
            name: 'BookAppointment',
            description: 'Books an appointment for the customer',
            url: 'https://your-api.com/book-appointment',
            method: 'POST',
            headers: {
              Authorization: 'Bearer YOUR_API_KEY',
            },
            body: {
              date: '{{input.date}}',
              time: '{{input.time}}',
              service: '{{input.service}}',
            },
            input_schema: {
              example: {
                speech:
                  'Got it - one second while I book your appointment for tomorrow at 10 AM.',
                date: '2024-04-20',
                time: '10:00 AM',
                service: 'Haircut',
              },
              type: 'object',
              properties: {
                speech: 'string',
                date: 'YYYY-MM-DD',
                time: 'HH:MM AM/PM',
                service: 'Haircut, Coloring, Trim, or Other',
              },
            },
            response: {
              succesfully_booked_slot: '$.success',
              stylist_name: '$.stylist_name',
            },
          },
        ]),
        voicemail_message: 'You have a new voicemail!',
        voicemail_action: 'hangup',
        retry: JSON.stringify({
          wait: 10,
          voicemail_action: 'leave_message',
          voicemail_message: 'Hello, this is a test message.',
        }),
        max_duration: 10,
        record: 'true',
        metadata: JSON.stringify({
          campaign_id: '1234',
          source: 'web',
        }),
        analysis_preset: 'a0f0d4ed-f5f5-4f16-b3f9-22166594d7a7',
        available_tags:
          'got_full_name_and_number, no_information_provided, transferred_to_agent',
        geospatial_dialing: 'bd039087-decb-435a-a6e3-ca1ffbf89974',
        precall_dtmf_sequence: '1234567890*#w',
      })

      // Should also be parseable for the API
      expect(() =>
        SendCallInputSchema.parse({
          ...parsedFields,
          phone_number: parsedFields.phoneNumber,
          pathway_id: parsedFields.pathwayId,
          request_data: parsedFields.requestData,
          analysis_schema: parsedFields.analysisSchema,
        }),
      ).not.toThrow()

      expect(parsedFields).toEqual({
        phoneNumber: '+12133734253',
        pathwayId: 'pathwayId',
        requestData: {
          name: 'John Doe',
        },
        pathwayVersion: 1,
        voice: 'John',
        background_track: 'office',
        first_sentence: 'Hello',
        wait_for_greeting: true,
        block_interruptions: true,
        interruption_threshold: 10,
        model: 'base',
        temperature: 0.5,
        dynamic_data: [
          {
            url: 'endpoint',
            method: 'GET',
            body: [],
            headers: [
              {
                key: 'Content-Type',
                value: 'application/json',
              },
            ],
            query: [],
            cache: true,
            response_data: [
              {
                context: '',
                data: '$',
                name: '',
              },
            ],
          },
        ],
        keywords: ['keyword-1', 'keyword-2'],
        pronunciation_guide: [
          {
            word: 'example',
            pronunciation: 'ex-am-ple',
            case_sensitive: 'false',
            spaced: 'false',
          },
          {
            word: 'API',
            pronunciation: 'A P I',
            case_sensitive: 'true',
            spaced: 'true',
          },
        ],
        language: 'en-US',
        local_dialing: true,
        voicemail_sms: {
          to: '+18001234567',
          message: 'You have a new voicemail!',
        },
        dispatch_hours: { start: '09:00', end: '17:00' },
        sensitive_voicemail_detection: true,
        noise_cancellation: true,
        ignore_button_press: true,
        timezone: 'America/New_York',
        tools: [
          {
            name: 'BookAppointment',
            description: 'Books an appointment for the customer',
            url: 'https://your-api.com/book-appointment',
            method: 'POST',
            headers: {
              Authorization: 'Bearer YOUR_API_KEY',
            },
            body: {
              date: '{{input.date}}',
              time: '{{input.time}}',
              service: '{{input.service}}',
            },
            input_schema: {
              example: {
                speech:
                  'Got it - one second while I book your appointment for tomorrow at 10 AM.',
                date: '2024-04-20',
                time: '10:00 AM',
                service: 'Haircut',
              },
              type: 'object',
              properties: {
                speech: 'string',
                date: 'YYYY-MM-DD',
                time: 'HH:MM AM/PM',
                service: 'Haircut, Coloring, Trim, or Other',
              },
            },
            response: {
              succesfully_booked_slot: '$.success',
              stylist_name: '$.stylist_name',
            },
          },
        ],
        voicemail_message: 'You have a new voicemail!',
        voicemail_action: 'hangup',
        retry: {
          wait: 10,
          voicemail_action: 'leave_message',
          voicemail_message: 'Hello, this is a test message.',
        },
        max_duration: 10,
        record: true,
        metadata: { campaign_id: '1234', source: 'web' },
        analysis_preset: 'a0f0d4ed-f5f5-4f16-b3f9-22166594d7a7',
        available_tags: [
          'got_full_name_and_number',
          'no_information_provided',
          'transferred_to_agent',
        ],
        geospatial_dialing: 'bd039087-decb-435a-a6e3-ca1ffbf89974',
        precall_dtmf_sequence: '1234567890*#w',
        completeExtensionActivityAsync: false,
      })
    })
  })

  describe('Action execution', () => {
    const fields = {
      phoneNumber: '1234567890',
      pathwayId: '123',
      requestData: JSON.stringify({
        name: 'John Doe',
      }),
      analysisSchema: JSON.stringify({
        name: 'string',
      }),
      otherData: JSON.stringify({
        foo: 'bar',
      }),
    }
    test('Should work', async () => {
      const res = await extensionAction.onEvent({
        payload: {
          fields,
          patient: {
            id: 'patient-id',
          },
          pathway: {
            id: 'pathway-id',
            definition_id: 'pathway-definition-id',
            tenant_id: '123',
          },
          activity: {
            id: 'activity-id',
          },
          settings: {
            apiKey: 'api-key',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(sendCallSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          phone_number: fields.phoneNumber,
          request_data: JSON.parse(fields.requestData),
          ...JSON.parse(fields.otherData),
          metadata: expect.objectContaining({
            awell_patient_id: 'patient-id',
            awell_care_flow_definition_id: 'pathway-definition-id',
            awell_care_flow_id: 'pathway-id',
            awell_activity_id: 'activity-id',
          }),
          analysis_schema: JSON.parse(fields.analysisSchema),
        }),
      )

      // Completion happens async via a Webhook from Bland
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          data_points: expect.objectContaining({
            call_id: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
          }),
          events: expect.any(Array),
        }),
      )
    })

    test('Should work with async completion via fields.webhook and completeExtensionActivityAsync', async () => {
      const res = await extensionAction.onEvent({
        payload: {
          fields: {
            ...fields,
            webhook: 'https://webhook.site/1234567890',
            completeExtensionActivityAsync: true,
          },
          patient: {
            id: 'patient-id',
          },
          pathway: {
            id: 'pathway-id',
            definition_id: 'pathway-definition-id',
            tenant_id: '123',
          },
          activity: {
            id: 'activity-id',
          },
          settings: {
            apiKey: 'api-key',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(sendCallSpy).toHaveBeenCalled()
      expect(sendCallSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          webhook: 'https://webhook.site/1234567890?activity_id=activity-id',
        }),
      )
      // Completion happens async via a Webhook from Bland
      expect(onComplete).not.toHaveBeenCalled()
    })

    test('Should use otherData.webhook and call onComplete (no async)', async () => {
      const res = await extensionAction.onEvent({
        payload: {
          fields: {
            ...fields,
            otherData: JSON.stringify({
              webhook: 'https://example.com/otherdata',
            }),
          },
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

      expect(sendCallSpy).toHaveBeenCalledWith(
        expect.objectContaining({ webhook: 'https://example.com/otherdata' }),
      )
      expect(onComplete).toHaveBeenCalled()
    })

    test('Should override fields.webhook with otherData.webhook and call onComplete (no async)', async () => {
      const res = await extensionAction.onEvent({
        payload: {
          fields: {
            ...fields,
            webhook: 'https://webhook.site/fields',
            otherData: JSON.stringify({
              webhook: 'https://webhook.site/otherdata',
            }),
            // completeExtensionActivityAsync stays false (default)
          },
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

      // otherData.webhook should override fields.webhook
      expect(sendCallSpy).toHaveBeenCalledWith(
        expect.objectContaining({ webhook: 'https://webhook.site/otherdata' }),
      )
      // Not async completion => onComplete should be called
      expect(onComplete).toHaveBeenCalled()
    })
  })
})

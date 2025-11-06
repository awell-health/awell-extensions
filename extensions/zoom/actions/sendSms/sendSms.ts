import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

const codes = [
  {
    code: 'INVALID_CONSUMER_NUMBER_FORMAT',
    errorMessage:
      'Invalid consumer number. The format of the consumer number used is incorrect. E.164 format is required',
  },
  {
    code: 'CONTACT_CENTER_NUMBER_USED',
    errorMessage:
      'Zoom Contact Center numbers cannot be used as consumer numbers',
  },
  {
    code: 'CONSUMER_NOT_OPTED_IN',
    errorMessage: 'The consumer number you have messaged has not opted in',
  },
  {
    code: 'CONSUMER_OPTED_OUT',
    errorMessage:
      'This consumer number has opted out of receiving SMS from this Zoom contact center number',
  },
  {
    code: 'CONSUMER_BLOCK_LISTED',
    errorMessage:
      'This consumer number is a part of the block list defined by your Zoom Contact Center account administrator and cannot be messaged',
  },
  {
    code: 'INTERNATIONAL_SMS_NOT_SUPPORTED',
    errorMessage: 'International messaging is not supported on this account',
  },
  // Keep non-enum validations we have seen from API responses
  {
    code: 'BODY_TOO_LONG',
    errorMessage:
      'Validation error: String must contain at most 500 character(s)',
  },
]

export const sendSms: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendSms',
  category: Category.COMMUNICATION,
  title: 'Send SMS',
  description: 'Send an SMS',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields, zoomSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { data } = await zoomSdk.sendSms({
      contact_center_number: fields.contactCenterNumber,
      consumer_numbers: [fields.to],
      body: fields.body,
    })

    /**
     * Custom error handling for Zoom API
     * For some errors, Zoom returns a 200 with success: false
     *
     * All other errors are handled with AxiosError and caught in Extensions Core
     */
    if (!data[0].success) {
      const failureDescription = data[0].description ?? 'Unknown error'
      const code = codes.find((code) =>
        failureDescription.includes(code.errorMessage),
      )?.code
      if (code !== undefined) {
        await onComplete({
          data_points: {
            code,
            success: String(false),
            messageId: null,
          },
          events: [
            addActivityEventLog({
              message: failureDescription,
            }),
          ],
        })
      } else {
        await onError({
          events: [
            addActivityEventLog({
              message: data[0].description ?? 'Unknown error',
            }),
          ],
        })
      }
      return
    }

    await onComplete({
      data_points: {
        messageId: data[0].message_id,
        success: String(data[0].success),
        code: 'SUCCESS',
      },
      events: [
        addActivityEventLog({
          message: `Success: ${String(data[0].success)}\nMessage ID: ${String(data[0].message_id)}\nDescription: ${String(data[0].description)}`,
        }),
      ],
    })
  },
}

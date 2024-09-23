import { z } from 'zod'
import twilioSdk from '../../../common/sdk/twilio'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { isNil } from 'lodash'
import { appendOptOutLanguage } from '../../../lib'
import { isTwilioErrorResponse, parseTwilioError } from '../../../lib/errors'

export const sendSms: Action<typeof fields, typeof settings> = {
  key: 'sendSms',
  title: 'Send SMS (with from number)',
  description:
    'Send a text message from a given telephone number to a recipient of your choice.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: {
          accountSid,
          authToken,
          fromNumber: defaultFromNumber,
          addOptOutLanguage,
          optOutLanguage,
          language,
        },
        fields: { recipient, message, from },
      } = validate({
        schema: z
          .object({
            settings: SettingsValidationSchema,
            fields: FieldsValidationSchema,
          })
          .superRefine((value, ctx) => {
            // if both `from` values missing - throw error
            if (isNil(value.settings.fromNumber) && isNil(value.fields.from)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                fatal: true,
                message:
                  '"From" number is missing in both settings and in the action field.',
              })
            }
          }),
        payload,
      })

      const client = twilioSdk(accountSid, authToken, {
        region: 'IE1',
        accountSid,
      })

      const { sid } = await client.messages.create({
        body: addOptOutLanguage
          ? appendOptOutLanguage(message, optOutLanguage, language)
          : message,
        from: from ?? defaultFromNumber,
        to: recipient,
      })

      const messageSidLog = `Message SID: ${sid}`

      await onComplete({
        data_points: {
          messageSid: sid,
        },
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: messageSidLog,
            },
          },
        ],
      })
    } catch (error) {
      if (isTwilioErrorResponse(error)) {
        await onError({
          events: [parseTwilioError(error)],
        })
      } else {
        // we handle ZodError and unknown errors in extension-server directly
        throw error
      }
    }
  },
}
